import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ProjectWorkbench } from "@/components/project-workbench";

describe("ProjectWorkbench", () => {
  it("reveals advanced modules only after the toggle is enabled", async () => {
    render(<ProjectWorkbench />);
    expect(screen.queryByText("Scheduled jobs")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("switch", { name: /advanced capabilities/i }));
    expect(screen.getByText("Scheduled jobs")).toBeInTheDocument();
  });
});
