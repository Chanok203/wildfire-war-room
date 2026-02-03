import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
    path: path.resolve(__dirname, '..', '..', '.env'),
});

import { createUser } from '../services/user.service';

const main = async () => {
    const username = 'chanok';
    const password = 'chanok';

    try {
        const user = await createUser(username, password);
        console.log(user);
    } catch (error) {
        console.log(error);
    }
};

main();
