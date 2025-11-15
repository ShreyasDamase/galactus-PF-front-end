"use client";
import React from "react";

type Props = { src: string };

export default function MobileFrameVideo({ src }: Props) {
  return (
    <div className="phone-wrapper">
      <div className="phone-frame">
        {/* Camera punch-hole */}
        <div className="phone-camera" />

        {/* Side buttons */}
        <div className="phone-button phone-button-power" />
        <div className="phone-button phone-button-volume-up" />
        <div className="phone-button phone-button-volume-down" />

        <div className="phone-screen">
          <iframe
            src={src}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Mobile video player"
          />
        </div>
      </div>
      <style jsx>{`
        .phone-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 2rem;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .phone-frame {
          position: relative;
          width: 360px;
          height: 740px;
          background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
          border: 12px solid #1a1a1a;
          border-radius: 48px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(255, 255, 255, 0.1),
            inset 0 0 0 1px rgba(255, 255, 255, 0.05);
          overflow: visible;
        }

        /* Camera punch-hole - centered at top */
        .phone-camera {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 12px;
          height: 12px;
          background: #000;
          border-radius: 50%;
          z-index: 10;
          box-shadow: 0 0 0 2px #0a0a0a,
            inset 0 1px 2px rgba(255, 255, 255, 0.1);
        }

        /* Side buttons */
        .phone-button {
          position: absolute;
          background: #4a4a4a;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.6),
            inset 0 1px 3px rgba(255, 255, 255, 0.2);
          z-index: 15;
        }

        .phone-button-power {
          right: -15px;
          top: 200px;
          width: 3px;
          height: 90px;
          background: linear-gradient(90deg, #555, #3a3a3a);
          border-radius: 0 4px 4px 0;
        }

        .phone-button-volume-up {
          left: -15px;
          top: 150px;
          width: 3px;
          height: 70px;
          background: linear-gradient(90deg, #3a3a3a, #555);
          border-radius: 4px 0 0 4px;
        }

        .phone-button-volume-down {
          left: -15px;
          top: 240px;
          width: 3px;
          height: 70px;
          background: linear-gradient(90deg, #3a3a3a, #555);
          border-radius: 4px 0 0 4px;
        }

        .phone-screen {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 36px;
          overflow: hidden;
          background: #000;
        }

        iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        @media (max-width: 420px) {
          .phone-frame {
            width: 280px;
            height: 580px;
            border-width: 10px;
            border-radius: 38px;
          }

          .phone-screen {
            border-radius: 28px;
          }

          .phone-camera {
            top: 16px;
            width: 10px;
            height: 10px;
          }

          .phone-button-power {
            right: -13px;
            top: 160px;
            width: 3px;
            height: 70px;
          }

          .phone-button-volume-up {
            left: -13px;
            top: 120px;
            width: 3px;
            height: 55px;
          }

          .phone-button-volume-down {
            left: -13px;
            top: 190px;
            width: 3px;
            height: 55px;
          }
        }
      `}</style>
    </div>
  );
}
