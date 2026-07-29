import PRThematicAnalysis, {
  IPRThematicAnalysis,
  IThematicCode,
  IThematicTheme,
} from "../models/PRThematicAnalysis";
import { getMongoDB } from "../MongoDB";

export async function savePRThematicAnalysis(
  analysisId: string,
  summary: string | undefined,
  codes: IThematicCode[],
  themes: IThematicTheme[],
  accountId: string
): Promise<IPRThematicAnalysis> {
  await getMongoDB();
  return await PRThematicAnalysis.create({
    analysisId,
    summary,
    codes,
    themes,
    accountId,
  });
}

export async function getPRThematicAnalysisForAccount(
  analysisId: string,
  accountId: string
): Promise<IPRThematicAnalysis | null> {
  await getMongoDB();
  return await PRThematicAnalysis.findOne({ analysisId, accountId });
}
