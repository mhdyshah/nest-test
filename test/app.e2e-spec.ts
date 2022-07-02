import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { EditUserDto } from '../src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from '../src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);

    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'arta.akbarii.132357@gmail.com',
      password: 'asad142536',
    };
    describe('Signup', () => {
      it('Should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ password: dto.password })
          .expectStatus(400);
        //.inspect()
      });
      it('Should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ email: dto.email })
          .expectStatus(400);
        //.inspect()
      });
      it('Should throw if no body provided', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
        //.inspect()
      });
      it('Should Signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
        // .inspect();
      });
    });

    describe('Signin', () => {
      it('Should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ password: dto.password })
          .expectStatus(400);
        //.inspect()
      });
      it('Should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ email: dto.email })
          .expectStatus(400);
        //.inspect()
      });
      it('Should throw if no body provided', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
        //.inspect()
      });
      it('should Signin', () => {
        return (
          pactum
            .spec()
            .post('/auth/signin')
            .withBody(dto)
            .expectStatus(200)
            // access token is stored in userAT variable
            .stores('userAT', 'access_token')
        );
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('Should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({ Authorization: 'Bearer $S{userAT}' })
          .expectStatus(200);
        // .inspect();
      });
    });

    describe('Edit user', () => {
      it('Should edit user', () => {
        const dto: EditUserDto = {
          lastName: 'Jamaliii',
          email: 'mahdi.jamaliii@gmail.com',
        };
        return pactum
          .spec()
          .patch('/users/update')
          .withHeaders({ Authorization: 'Bearer $S{userAT}' })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.lastName)
          .expectBodyContains(dto.lastName);
        // .inspect();
      });
    });
  });

  describe('Bookmarks', () => {
    describe('Get empty bookmark', () => {
      it('Should get empy bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({ Authorization: 'Bearer $S{userAT}' })
          .expectStatus(200)
          .expectBody([]);
        // .inspect();
      });
    });

    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'test onee',
        description: 'testing descriptionss',
        link: 'https://github.com/',
      };
      it('Should create bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks/create')
          .withHeaders({ Authorization: 'Bearer $S{userAT}' })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
        // .inspect();
      });
    });

    describe('Get bookmarks', () => {
      it('Should get all bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({ Authorization: 'Bearer $S{userAT}' })
          .expectStatus(200)
          .expectJsonLength(1);
        // .inspect();
      });
    });

    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}');
      });
    });

    describe('Edit bookmark by id', () => {
      const dto: EditBookmarkDto = {
        title: 'this is for editing tests',
        description: 'this can be for editting tests description',
        link: 'https://www.uber.com/ca/en/',
      };
      it('should edit bookmark by id', () => {
        return pactum
          .spec()
          .patch('/bookmarks/edit/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withBody(dto)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });
    });

    describe('Delete bookmark by id', () => {
      it('should delete bookmark by id', () => {
        return pactum
          .spec()
          .delete('/bookmarks/delete/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(204);
      });
      it('Should get empty bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({ Authorization: 'Bearer $S{userAT}' })
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});
