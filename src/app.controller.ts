import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { User } from '@prisma/client';
import { UserService } from './user.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly userService: UserService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/users')
  async getUsers(): Promise<User[]> {
    console.time('getUsers');
    const users = await this.userService.users({
      include: {
        posts: {
          where: { content: { contains: 'HAHA' } },
          orderBy: { authorId: 'desc' },
          take: 1,
        },
      },
    });
    console.timeEnd('getUsers');
    return users;
  }

  @Post('/users')
  async createUsers(): Promise<number[]> {
    return Promise.all(
      Array.from(new Array(1000)).map(async (_, i) => {
        const user = {
          email: `sebviaene+${i}@gmail.com`,
          name: 'Sebastiaan',
        };

        const post = await this.userService.createPost({
          title: 'test',
          content: 'HAHA',
          author: { create: user },
        });

        return post.authorId;
      }),
    );
  }
}
