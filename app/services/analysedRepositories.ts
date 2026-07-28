import { apiPost } from "./apiClient";
import { Repository } from "./repositories";

export async function createAnalysedRepository(analysisId: string, repository: Repository) {
    return apiPost("/api/analysed-repositories", {
        analysisId,
        repositoryId: repository.id,
        name: repository.name,
        fullName: repository.fullName,
        ownerLogin: repository.owner.login,
    });
}
