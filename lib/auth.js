import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "identify",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.discordId = profile.id;
        token.username = profile.username;
        token.globalName = profile.global_name || profile.username;
        token.avatar = profile.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.discordId = token.discordId;
        session.user.username = token.username;
        session.user.globalName = token.globalName;
        session.user.avatar = token.avatar;
        if (token.discordId && token.avatar) {
          session.user.image = `https://cdn.discordapp.com/avatars/${token.discordId}/${token.avatar}.png`;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/dashboard",
  },
  trustHost: true,
});
