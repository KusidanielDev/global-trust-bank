import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);

export async function createLinkToken(userId: string) {
  const response = await plaidClient.linkTokenCreate({
    user: { client_user_id: userId },
    client_name: "GlobalTrust Bank",
    products: ["auth", "transactions"],
    country_codes: ["US"],
    language: "en",
  });
  return response.data.link_token;
}

export async function exchangePublicToken(publicToken: string) {
  const response = await plaidClient.itemPublicTokenExchange({
    public_token: publicToken,
  });
  return response.data;
}
