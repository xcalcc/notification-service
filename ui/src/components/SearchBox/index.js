import React, {useState} from "react";
import PropTypes from 'prop-types';
import {Search} from 'react-bootstrap-icons';

import './search-box.scss';

const SearchBox = props => {
    const [searchValue, setSearchValue] = useState('');

    const handleChange = event => {
        setSearchValue(event.target.value);
        props.onSearch(event.target.value);
    }

    const handleKeyup = (event) => {
        if(event.keyCode === 13) {
            props.onSearch(searchValue);
        }
    }

    return <div className="scanning-search">
        <input
            className="form-control"
            type="search"
            placeholder="value"
            value={searchValue}
            onChange={handleChange}
            onKeyUp={handleKeyup}
        />
        <button className="btn-search" onClick={() => props.onSearch(searchValue)}>
            <Search />
        </button>
    </div>
}

SearchBox.propTypes = {
    onSearch: PropTypes.func
}

SearchBox.defaultProps = {
    onSearch: () => {}
}

export default SearchBox;
