import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { VideoUploadInput } from "@/components/video/video-upload-input";

describe("VideoUploadInput", () => {
  it("accepts video files and marks cancelled selection as touched", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onTouched = vi.fn();

    render(
      <VideoUploadInput
        videos={[]}
        existingMatches={[]}
        onSelect={onSelect}
        onTouched={onTouched}
      />,
    );

    const input = screen.getByLabelText("Add video");

    expect(input).toHaveAttribute("accept", "video/*");

    await user.upload(input, []);

    expect(onTouched).toHaveBeenCalled();
  });
});
