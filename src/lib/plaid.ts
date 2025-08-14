import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  Products,
  CountryCode,
} from "plaid";

const config = new Configuration({
  basePath: PlaidEnvironments.sandbox, // or development/production
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID!,
      "PLAID-SECRET": process.env.PLAID_SECRET!,
    },
  },
});

export const plaidClient = new PlaidApi(config);

// Create a link token
export async function createLinkToken(userId: string) {
  const response = await plaidClient.linkTokenCreate({
    user: { client_user_id: userId },
    client_name: "Your App Name",
    products: [Products.Auth, Products.Transactions], // ✅ enums
    country_codes: [CountryCode.Us], // ✅ enums
    language: "en",
  });

  return response.data;
}

// Exchange a public token for an access token
export async function exchangePublicToken(publicToken: string) {
  const response = await plaidClient.itemPublicTokenExchange({
    public_token: publicToken,
  });
  return response.data;
}
