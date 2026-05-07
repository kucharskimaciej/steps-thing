import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { VideoPlayer } from "@/components/video/video-player";

function installVideoMediaMocks() {
  Object.defineProperty(HTMLMediaElement.prototype, "duration", {
    configurable: true,
    get() {
      return Number(this.dataset.duration ?? 10);
    },
  });
  Object.defineProperty(HTMLMediaElement.prototype, "videoWidth", {
    configurable: true,
    get() {
      return Number(this.dataset.videoWidth ?? 1920);
    },
  });
  Object.defineProperty(HTMLMediaElement.prototype, "videoHeight", {
    configurable: true,
    get() {
      return Number(this.dataset.videoHeight ?? 1080);
    },
  });
  HTMLMediaElement.prototype.play = vi.fn(function play(
    this: HTMLMediaElement,
  ) {
    this.dispatchEvent(new Event("play"));
    return Promise.resolve();
  });
  HTMLMediaElement.prototype.pause = vi.fn(function pause(
    this: HTMLMediaElement,
  ) {
    this.dispatchEvent(new Event("pause"));
  });
}

function fireMediaEvent(video: HTMLVideoElement, eventName: string) {
  act(() => {
    video.dispatchEvent(new Event(eventName, { bubbles: true }));
  });
}

describe("VideoPlayer", () => {
  beforeEach(() => {
    installVideoMediaMocks();
  });

  it("renders a reusable looped muted video and emits viewed after 80 percent", () => {
    const onViewed = vi.fn();

    render(<VideoPlayer videoUrl="/video.mp4" onViewed={onViewed} />);

    const video = screen.getByLabelText("Step video") as HTMLVideoElement;
    expect(video).toHaveAttribute("loop");
    expect(video).toHaveAttribute("playsinline");
    expect(video).toHaveAttribute("preload", "metadata");
    expect(video.muted).toBe(true);

    video.currentTime = 7.9;
    fireMediaEvent(video, "timeupdate");
    expect(onViewed).not.toHaveBeenCalled();

    video.currentTime = 8;
    fireMediaEvent(video, "timeupdate");
    fireMediaEvent(video, "timeupdate");
    expect(onViewed).toHaveBeenCalledTimes(1);

    video.currentTime = 0.9;
    fireMediaEvent(video, "timeupdate");
    video.currentTime = 8.2;
    fireMediaEvent(video, "timeupdate");
    expect(onViewed).toHaveBeenCalledTimes(2);
  });

  it("toggles playback, mute, seek controls, restart, and slow motion", async () => {
    const user = userEvent.setup();

    render(<VideoPlayer videoUrl="/video.mp4" />);

    const video = screen.getByLabelText("Step video") as HTMLVideoElement;
    const controls = screen.getByRole("group", { name: "Video controls" });

    await user.click(screen.getByRole("button", { name: "Play video" }));
    expect(video.play).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Pause video" }));
    expect(video.pause).toHaveBeenCalledTimes(1);

    expect(video.muted).toBe(true);
    await user.click(
      within(controls).getByRole("button", { name: "Unmute video" }),
    );
    expect(video.muted).toBe(false);

    video.currentTime = 6;
    await user.click(
      within(controls).getByRole("button", { name: "Back 5 seconds" }),
    );
    expect(video.currentTime).toBe(1);

    await user.click(
      within(controls).getByRole("button", { name: "Back 1 second" }),
    );
    expect(video.currentTime).toBe(0);

    await user.click(
      within(controls).getByRole("button", { name: "Forward 1 second" }),
    );
    expect(video.currentTime).toBe(1);

    await user.click(
      within(controls).getByRole("button", { name: "Play from start" }),
    );
    expect(video.currentTime).toBe(0);

    await user.click(
      within(controls).getByRole("button", { name: "Enable slow motion" }),
    );
    expect(video.playbackRate).toBe(0.5);

    await user.click(
      within(controls).getByRole("button", { name: "Disable slow motion" }),
    );
    expect(video.playbackRate).toBe(1);
  });

  it("renders snapshot background, progress, and borderless modal", async () => {
    const user = userEvent.setup();

    render(
      <VideoPlayer
        videoUrl="/video.mp4"
        snapshotUrl="/snapshot.jpg"
        enableFullSize
      />,
    );

    const background = screen.getByTestId("video-snapshot-background");
    expect(background).toHaveStyle({ backgroundImage: 'url("/snapshot.jpg")' });

    const video = screen.getByLabelText("Step video") as HTMLVideoElement;
    video.currentTime = 4;
    fireMediaEvent(video, "timeupdate");
    expect(
      screen.getByRole("progressbar", { name: "Video progress" }),
    ).toHaveAttribute("aria-valuenow", "40");

    await user.click(
      screen.getByRole("button", { name: "Open full size video" }),
    );
    const modal = screen.getByRole("dialog", { name: "Full size video" });
    expect(modal).toHaveAttribute("data-borderless", "true");
    expect(
      within(modal).getByLabelText("Full size video player"),
    ).toBeInTheDocument();
  });

  it("rotates landscape video on narrow portrait clients", () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockReturnValue({
        matches: true,
        media: "(orientation: portrait)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    });

    render(
      <VideoPlayer
        videoUrl="/video.mp4"
        enableFullSize
        modalOpen
        width={1920}
        height={1080}
      />,
    );

    expect(
      within(
        screen.getByRole("dialog", { name: "Full size video" }),
      ).getByTestId("aspect-aware-video-frame"),
    ).toHaveAttribute("data-rotated", "true");
  });
});
