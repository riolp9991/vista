const { ipcMain } = require("electron");
const { Moovie } = require("../../models/moovies");
const { Op } = require("sequelize");

const axios = require("axios");

const fixLink = (url) => {};

const findTheMoovies = async (title = "", year = "", limit = 0, offset = 0) => {
    console.log("Fetching Moovies");
    const data = await Moovie.findAll({
        order: [
            ["year", "DESC"],
            ["title", "ASC"],
        ],
        where: {
            title: {
                [Op.like]: `%${title}%`,
            },
            year: {
                [Op.like]: `%${year}%`,
            },
        },
        limit: limit,
        offset: offset,
    });

    const count = await Moovie.count({
        where: {
            title: {
                [Op.like]: `%${title}%`,
            },
            year: {
                [Op.like]: `%${year}%`,
            },
        },
    });

    //console.table({ data });

    return { data, count };
};

ipcMain.on("moovies-communication", async (event, args) => {
    //console.log({ args });
    if (args.message === "find") {
        //console.log("SEARCHING");
        const data = await findTheMoovies(
            args.title,
            args.year,
            args.limit,
            args.offset
        );
        event.reply("fetched-moovies", data);
    } else event.reply("no-event");
    if (args.message === "findOne") {
        //console.log("SEARCHING BY ID");
        const data = await Moovie.findByPk(args.id);
        event.reply("fetched-moovie", data);
    }
    if (args.message === "fetchMoovieData") {
        //console.log("Searching moovie online data");
        console.log({ args });
        console.log({ LINK: args.link });
        try {
            const data = await getMoovieOnlineData(args.link);
            console.log({ RETURN_DATA: data });
            event.reply("scrapped-data", data);
        } catch (error) {
            //console.error({ error });
            console.log("AN ERROR HAS OCURED");
            event.reply("scrappedData", null);
        }
    }
});

const cheerio = require("cheerio");
const xml2js = require("xml2js");

const getMoovieOnlineData = async (moovieLink = "") => {
    console.log(`FETCHING MOOVIE LINK: ${moovieLink}`);
    let response = await axios.get(moovieLink);
    console.log({ response });
    //try {
    //response = await axios.get(moovieLink);
    //console.log({ response });
    //} catch (error) {
    //console.log({
    //AXIOS_ERROR: error,
    //});
    //throw error;
    //}
    const html = response.data;

    const $ = cheerio.load(html);
    const linkObjects = $("a");

    const SCRAPPED_LINKS = [];

    linkObjects.splice(5).forEach((element, index) => {
        let text = $(element).text();

        const textSlices = text.split(".");
        let fixedText = "";

        for (let i = 0; i < textSlices.length - 1; i++) {
            const spaceAtEnd = i === textSlices.length - 2 ? "" : " ";
            fixedText += textSlices[i] + spaceAtEnd;
        }
        fixedText.trimEnd();
        fixedText += `.${textSlices[textSlices.length - 1]}`;

        SCRAPPED_LINKS.push({
            text: text, // get the text
            fixedText,
            link: `${moovieLink}${$(element).attr("href")}`,
        });
    });

    //console.table(SCRAPPED_LINKS);

    const nfoMatch = SCRAPPED_LINKS.find((element) => {
        if (element.fixedText.includes(".nfo")) {
            return element;
        }
    });

    let fetchedNfo;
    let parsedNfo;

    console.log({ nfoMatch });

    if (nfoMatch !== undefined) {
        const data = await axios.get(nfoMatch.link);
        fetchedNfo = data.data;
        console.log({ data });
    }

    xml2js.parseString(fetchedNfo, (err, result) => {
        if (err) parsedNfo = null;
        parsedNfo = result;
    });

    //console.log({ nfoMatch, parsedNfo });

    console.log({ SCRAPPED_LINKS, parsedNfo });
    return { links: SCRAPPED_LINKS, info: parsedNfo };
};
