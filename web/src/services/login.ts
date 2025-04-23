import request, {apiRequest} from 'utils/request';

export interface ILoginRequest {
    name: string;
    password: string;
}

export interface ILoginResult {
    /** 用户组详细 */
    loginResponse: ILoginResponse
}

export interface ILoginResponse {
    token: string
    name: string
    role: string
    user_id: string
    owner_id: string
}

export const doLogin = async (params: ILoginRequest) => {
    const response = await apiRequest<ILoginResult>({ action: 'auth/v1/user/login', data: params });
    return response.loginResponse;
};
