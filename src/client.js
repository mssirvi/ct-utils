import { createClient, createAuthForClientCredentialsFlow, createHttpClient} from '@commercetools/sdk-client-v2';
import { createApiBuilderFromCtpClient } from '@commercetools/platform-sdk';
// import { createLoggerMiddleware } from '@commercetools/sdk-middleware-logger';
import { logger } from './logger.js';
import dotenv from 'dotenv';
dotenv.config();

import fetch from "node-fetch";

const projectKey = process.env.CTP_PROJECT_KEY;

// Client Credentials authorization flow
export const getClient = () => {
    console.log('-----------------Running for : ' + projectKey);
    const authMiddlewareOptions = createAuthForClientCredentialsFlow({
        host: process.env.CTP_AUTH_URL,
        projectKey: projectKey,
        credentials: {
            clientId: process.env.CTP_CLIENT_ID,
            clientSecret: process.env.CTP_CLIENT_SECRET,
        },
        fetch
    })
    const httpMiddlewareOptions = createHttpClient({
        host: process.env.CTP_API_URL,
        enableRetry: true,
        retryConfig: {
            maxRetries: 3,
            retryDelay: 200,
            backoff: false,
            retryCodes: [403]
        },
        fetch,
    })
    const client = createClient({
        middlewares: [authMiddlewareOptions, httpMiddlewareOptions, logger]
    })
    return client;
};

export const apiRoot = createApiBuilderFromCtpClient(getClient()).withProjectKey({projectKey});
