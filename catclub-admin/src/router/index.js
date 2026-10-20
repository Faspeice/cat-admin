import * as realAuth from './auth.js'
import * as realPosts from './posts.js'
import * as realUsers from './users.js'
import * as realModeration from './moderation.js'
import { mockAuthApi, mockPostsApi, mockUsersApi, mockModerationApi } from './__mocks__/index.js'

const USE_MOCKS = import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS !== 'false'

export const authApi = USE_MOCKS ? mockAuthApi : realAuth.authApi
export const postsApi = USE_MOCKS ? mockPostsApi : realPosts.postsApi
export const usersApi = USE_MOCKS ? mockUsersApi : realUsers.usersApi
export const moderationApi = USE_MOCKS ? mockModerationApi : realModeration.moderationApi