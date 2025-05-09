import React from 'react';
import { render, fireEvent, queryByText } from '@testing-library/react';
import { Basic as BasicStory } from './Dropdown.stories';

// wrap component with i18n provider, so component can use useTranslation()
const DropdownStory = withI18n(BasicStory);

describe('Dropdown component', () => {
  it('Should select item correctly', () => {
    const { container } = render(<DropdownStory />);

    // make sure dropdown items are hidden
    let dropdownItems = container.querySelector('.Dropdown__items');
    expect(dropdownItems).toBeInTheDocument();
    expect(dropdownItems).toHaveClass('hide');

    // make sure Position item is selected by default
    let activeButton = container.querySelector('.active');
    expect(activeButton).toBeInTheDocument();
    expect(activeButton).toHaveTextContent('Position');

    // click to open dropdown menu
    const dropdown = container.querySelector('.Dropdown');
    expect(dropdown).toBeInTheDocument();
    expect(dropdown.getAttribute('aria-expanded')).toEqual('false');
    fireEvent.mouseDown(dropdown);

    // make sure dropdown menu is open
    dropdownItems = container.querySelector('.Dropdown__items');
    expect(dropdownItems).toBeInTheDocument();
    expect(dropdownItems).not.toHaveClass('hide');

    const dropdown2 = container.querySelector('.Dropdown');
    expect(dropdown2).toBeInTheDocument();
    expect(dropdown2.getAttribute('aria-expanded')).toEqual('true');

    // WISEflow: Changed status translation to Share Type
    // click Status button and make sure active element is changed to Status
    const statusButton = queryByText(dropdownItems, 'Share Type');
    fireEvent.click(statusButton);
    activeButton = container.querySelector('.active');
    expect(activeButton).toHaveTextContent('Share Type');
  });
});
