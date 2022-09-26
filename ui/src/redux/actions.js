export default {
    setConvertedData: data => (dispatch, getState, api) => {
        dispatch({
            type: 'SET_CONVERTED_DATA',
            payload: data
        });
    },
};
