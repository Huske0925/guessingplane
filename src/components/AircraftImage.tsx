import { useState } from "react";
import type { Aircraft } from "../types/aircraft";

export function AircraftImage({ aircraft }: { aircraft: Aircraft }) {
  const [failed, setFailed] = useState(false);
  const image = aircraft.image;
  const hasImage = Boolean(image?.imageUrl) && !failed;

  return (
    <div className="aircraft-image-card">
      {hasImage ? (
        <img
          src={image?.imageUrl}
          alt={`${aircraft.airline} ${aircraft.aircraftModel} ${aircraft.liveryName}，注册号 ${aircraft.registration}`}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="image-placeholder">
          <div className="placeholder-sky">
            <span className="placeholder-plane" aria-hidden="true">✈</span>
          </div>
          <strong>准确图片稍后补充</strong>
          <p>当前先完成核心玩法，之后可接入你提供并核验过的图片。</p>
        </div>
      )}

      {image?.imageSourceUrl && (
        <div className="image-credit">
          图片来源：{image.imageSource ?? "查看来源"}
          {image.photographer ? ` · ${image.photographer}` : ""}
          {image.license ? ` · ${image.license}` : ""}
          <a href={image.imageSourceUrl} target="_blank" rel="noreferrer">查看原图 / 来源</a>
        </div>
      )}
    </div>
  );
}
