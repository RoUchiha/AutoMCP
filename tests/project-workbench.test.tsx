import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ProjectWorkbench } from "@/components/project-workbench";

describe("ProjectWorkbench", () => {
  it("shows the four-stage creation flow and a factual build receipt", () => {
    render(<ProjectWorkbench />);

    expect(screen.getByText("Intent")).toBeInTheDocument();
    expect(screen.getByText("Source")).toBeInTheDocument();
    expect(screen.getByText("Policy")).toBeInTheDocument();
    expect(screen.getByText("Package")).toBeInTheDocument();
    expect(screen.getByText(/policy and contract checks/i)).toBeInTheDocument();
    expect(screen.getByText("2 operations generated")).toBeInTheDocument();
    expect(screen.getByText(/does not call your endpoint or retain credentials/i)).toBeInTheDocument();
  });

  it("reveals advanced modules only after the toggle is enabled", async () => {
    render(<ProjectWorkbench />);
    expect(screen.queryByText("Scheduled jobs")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("switch", { name: /advanced capabilities/i }));
    expect(screen.getByText("Scheduled jobs")).toBeInTheDocument();
  });
});
