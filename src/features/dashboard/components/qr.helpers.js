import QRCode from "qrcode";

// Genera la imagen del "Punto Infocasa" en alta resolución (2480 x 3508)
export function buildPuntoInfocasaCanvas(propertyId) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const width = 2480;
    const height = 3508;
    canvas.width = width;
    canvas.height = height;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/img/punto-infocasa-base.jpg";

    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);

      const qrSize = 450;
      const x = width - qrSize;
      const y = height - qrSize;
      const shortUrl = `${window.location.origin}/property/${propertyId}?ref=qr`;

      QRCode.toCanvas(
        document.createElement("canvas"),
        shortUrl,
        {
          width: qrSize,
          margin: 0,
          errorCorrectionLevel: "L",
          color: { dark: "#000000", light: "#ffffff" },
        },
        (error, qrCanvas) => {
          if (error) {
            console.error("Error al generar QR:", error);
            reject(error);
            return;
          }
          ctx.drawImage(qrCanvas, x, y, qrSize, qrSize);
          resolve(canvas);
        }
      );
    };

    img.onerror = () => reject(new Error("No se pudo cargar la imagen base"));
  });
}
