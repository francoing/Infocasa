import { describe, it, expect } from "vitest";
import {
  chunkRanges,
  newUploadId,
  pickVideoFiles,
  buildVideoOps,
  MAX_VIDEO_BYTES,
  VIDEO_CHUNK_BYTES,
} from "../../features/property/videoUpload.helpers";

const fakeFile = (name, type, size) => {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
};

describe("chunkRanges", () => {
  it("parte el archivo en trozos de 5 MB cubriendo todos los bytes", () => {
    const size = VIDEO_CHUNK_BYTES * 2 + 123;
    const ranges = chunkRanges(size);
    expect(ranges).toHaveLength(3);
    expect(ranges[0]).toEqual([0, VIDEO_CHUNK_BYTES]);
    expect(ranges[2]).toEqual([VIDEO_CHUNK_BYTES * 2, size]);
  });

  it("un archivo de 200 MB entra en el máximo de 40 partes del backend", () => {
    expect(chunkRanges(MAX_VIDEO_BYTES)).toHaveLength(40);
  });

  it("devuelve vacío para tamaño 0", () => {
    expect(chunkRanges(0)).toEqual([]);
  });
});

describe("newUploadId", () => {
  it("genera un UUID v4", () => {
    expect(newUploadId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
});

describe("pickVideoFiles", () => {
  it("acepta videos y descarta otros tipos con mensaje", () => {
    const video = fakeFile("casa.mp4", "video/mp4", 1000);
    const foto = fakeFile("casa.jpg", "image/jpeg", 1000);
    const { accepted, error } = pickVideoFiles([video, foto], 0);
    expect(accepted).toEqual([video]);
    expect(error).toMatch(/Solo se pueden subir videos/);
  });

  it("rechaza videos de más de 200 MB", () => {
    const big = fakeFile("largo.mov", "video/quicktime", MAX_VIDEO_BYTES + 1);
    const { accepted, error } = pickVideoFiles([big], 0);
    expect(accepted).toEqual([]);
    expect(error).toMatch(/200 MB/);
  });

  it("respeta el cupo de videos", () => {
    const files = [1, 2, 3].map((n) => fakeFile(`v${n}.mp4`, "video/mp4", 10));
    const { accepted, error } = pickVideoFiles(files, 1, 3);
    expect(accepted).toHaveLength(2);
    expect(error).toMatch(/hasta 3 videos/);
  });
});

describe("buildVideoOps", () => {
  it("separa archivos nuevos y videos existentes quitados", () => {
    const nuevo = fakeFile("nuevo.mp4", "video/mp4", 10);
    const initialData = { videos: [{ id: 1 }, { id: 2 }] };
    const ops = buildVideoOps([{ id: 2, status: "ready" }, nuevo], initialData);
    expect(ops.videoFiles).toEqual([nuevo]);
    expect(ops.deletedVideoIds).toEqual([1]);
  });
});
