import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RepositoryRepository } from '@pimp-my-pr/server/repository/core/domain-services';
import { EditRepositoryCommand } from './edit-repository.command';
import { RepositoryEntity } from '@pimp-my-pr/server/repository/core/domain';

@CommandHandler(EditRepositoryCommand)
export class EditRepositoryHandler implements ICommandHandler<EditRepositoryCommand> {
  constructor(private repositoryRepository: RepositoryRepository) {}

  async execute(command: EditRepositoryCommand): Promise<void> {
    const { repositoryId, maxLines, maxWaitingTime } = command;

    const repositoryData = await this.repositoryRepository.getById(repositoryId);

    const updatedRepository = { ...repositoryData, maxLines, maxWaitingTime } as RepositoryEntity;

    return this.repositoryRepository.save(updatedRepository);
  }
}
