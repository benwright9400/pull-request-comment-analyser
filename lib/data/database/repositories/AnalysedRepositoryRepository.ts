import AnalysedRepository, { IAnalysedRepository } from "../models/AnalysedRepository";
import { getMongoDB } from "../MongoDB";

export async function createAnalysedRepository(
  analysisId: string,
  repositoryId: number,
  name: string,
  fullName: string,
  ownerLogin: string,
  accountId: string
): Promise<IAnalysedRepository> {
  await getMongoDB();
  return await AnalysedRepository.create({
    analysisId,
    repositoryId,
    name,
    fullName,
    ownerLogin,
    accountId,
  });
}
