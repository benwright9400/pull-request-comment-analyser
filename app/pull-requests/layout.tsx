import { ReactNode } from "react";
import { PRAnalysisSessionProvider } from "./providers/PRAnalysisSessionProvider";

export default function PullRequestsLayout({ children }: { children: ReactNode }) {
    return <PRAnalysisSessionProvider>{children}</PRAnalysisSessionProvider>;
}
