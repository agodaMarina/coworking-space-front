interface User {
    id: number;
    email: string;
    username: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    phone?: string;
    avatar?: string;
    role: string;
    is_verified: boolean;
    created_at: Date;
}
