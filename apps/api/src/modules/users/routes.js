export async function usersRoutes(app) {
  app.get(
    '/me',
    {
      onRequest: [app.authenticate]
    },
    async (request) => ({
      user: {
        id: request.user.sub,
        email: request.user.email,
        username: request.user.username,
        fullName: request.user.fullName
      }
    })
  );
}
