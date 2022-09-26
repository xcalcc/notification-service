import {produce} from "immer";

const initState = {
    convertedExcel: [],
};

export default produce((draft, action) => {
    switch (action.type) {
        case 'SET_CONVERTED_DATA':
            draft.convertedExcel = action.payload;
    }
}, initState);

