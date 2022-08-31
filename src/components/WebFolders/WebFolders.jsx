import "./WebFolders.css";
import { getLinks } from "./functions";
import { useState, useEffect } from "react";
import { FlatButton } from "../FlatButton/index.js";

import {
  faDownload,
  faClipboard,
  faFolder,
  faFile,
  faImage,
  faFileVideo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const WebFolders = ({ link = "", background = "var(--solid-bg)" }) => {
  const [currentLink, setCurrentLink] = useState(link);
  const [items, setItems] = useState([]);

  const searchLinks = async () => {
    const links = await getLinks(currentLink);
    setItems(links);
  };

  useEffect(() => {
    if (!currentLink.includes(link)) setCurrentLink(link);
    searchLinks();
  }, [currentLink]);

  useEffect(() => {
    //setCurrentLink(link);
  }, [link]);

  useEffect(() => {
    setCurrentLink(link);
  }, [link]);

  const linksList =
    items && items.length > 0 ? (
      items.map((element, index) => {
        return (
          <WebLink
            onClick={() => setCurrentLink(element.link)}
            key={`link ${index}`}
            text={element.text}
          />
        );
      })
    ) : (
      <h1 className="nothing-found">No se han cargado los ficheros</h1>
    );

  return (
    <div
      className="web-folder-viewer"
      style={{ "--web-folder-background": background }}
    >
      <span className="link">{currentLink}</span>
      <span className="separator" />
      {linksList}
    </div>
  );
};

const WebLink = ({
  text = "HELLo",
  onClick = () => {
    console.log(text);
  },
  link = "",
}) => {
  console.log(text.split("."));
  const isFolder = text.split(".")[0] == "" || text.split(".").length == 1;
  console.log(isFolder);

  let icon = faFile;

  if (isFolder) icon = faFolder;
  if (text.includes(".png") || text.includes(".jpg")) icon = faImage;
  if (text.includes(".mp4") || text.includes(".avi") || text.includes(".mpg"))
    icon = faFileVideo;
  return (
    <div onClick={onClick} className="web-folder-link">
      <div className="content">
        <h1>
          <FontAwesomeIcon icon={icon} />
          &nbsp; &nbsp;
          {text}
        </h1>
        <div className="icons">
          <FlatButton font-size="1em" text="" icon={faClipboard} />
          <FlatButton font-size="1em" text="" icon={faDownload} />
        </div>
      </div>
    </div>
  );
};

export default WebFolders;
