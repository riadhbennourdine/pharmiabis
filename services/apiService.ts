import { PharmIaData, MemoFiche } from '../types';

const API_BASE_URL = '/api';

export const getAllData = async (): Promise<PharmIaData> => {
    const response = await fetch(`${API_BASE_URL}/data`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch data from server' }));
        throw new Error(errorData.message);
    }
    return response.json();
};

export const addMemoFicheToServer = async (fiche: MemoFiche): Promise<MemoFiche> => {
    const response = await fetch(`${API_BASE_URL}/memofiches`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(fiche),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to save memofiche to server' }));
        throw new Error(errorData.message);
    }
    return response.json();
};

export const deleteMemoFicheFromServer = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/memofiches/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete memofiche from server' }));
        throw new Error(errorData.message);
    }
};