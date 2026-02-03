import { v4 as uuidv4 } from 'uuid';

export const generateUUID = (): string => {
    return uuidv4();
};

export const generateApiKey = (): string => {
    return `apiKey_${uuidv4()}`;
};
