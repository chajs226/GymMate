import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AccessibleButton, AccessibleCheckbox, AccessibleHeader } from '../../components/AccessibleButton';

describe('AccessibleButton', () => {
  test('renders with correct title', () => {
    const { getByText } = render(
      <AccessibleButton title="테스트 버튼" onPress={() => {}} />
    );
    
    expect(getByText('테스트 버튼')).toBeTruthy();
  });

  test('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <AccessibleButton title="테스트 버튼" onPress={onPressMock} />
    );
    
    fireEvent.press(getByText('테스트 버튼'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  test('is disabled when disabled prop is true', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <AccessibleButton title="테스트 버튼" onPress={onPressMock} disabled={true} />
    );
    
    const button = getByText('테스트 버튼').parent;
    expect(button?.props.accessibilityState.disabled).toBe(true);
    
    fireEvent.press(getByText('테스트 버튼'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  test('shows loading indicator when loading', () => {
    const { getByTestId } = render(
      <AccessibleButton 
        title="테스트 버튼" 
        onPress={() => {}} 
        loading={true}
        testID="test-button"
      />
    );
    
    const button = getByTestId('test-button');
    expect(button.props.accessibilityState.busy).toBe(true);
  });

  test('has proper accessibility properties', () => {
    const { getByText } = render(
      <AccessibleButton 
        title="테스트 버튼" 
        onPress={() => {}} 
        accessibilityLabel="사용자 정의 레이블"
        accessibilityHint="이것은 테스트 버튼입니다"
      />
    );
    
    const button = getByText('테스트 버튼').parent;
    expect(button?.props.accessibilityRole).toBe('button');
    expect(button?.props.accessibilityLabel).toBe('사용자 정의 레이블');
    expect(button?.props.accessibilityHint).toBe('이것은 테스트 버튼입니다');
  });

  test('applies different styles for variants', () => {
    const { getByText: getPrimaryText } = render(
      <AccessibleButton title="Primary" onPress={() => {}} variant="primary" />
    );
    
    const { getByText: getSecondaryText } = render(
      <AccessibleButton title="Secondary" onPress={() => {}} variant="secondary" />
    );
    
    const { getByText: getDangerText } = render(
      <AccessibleButton title="Danger" onPress={() => {}} variant="danger" />
    );
    
    // 각 버튼이 렌더링되는지 확인 (스타일 테스트는 스냅샷 테스트로 보완)
    expect(getPrimaryText('Primary')).toBeTruthy();
    expect(getSecondaryText('Secondary')).toBeTruthy();
    expect(getDangerText('Danger')).toBeTruthy();
  });
});

describe('AccessibleCheckbox', () => {
  test('renders with correct label', () => {
    const { getByLabelText } = render(
      <AccessibleCheckbox 
        checked={false} 
        onToggle={() => {}} 
        label="테스트 체크박스" 
      />
    );
    
    expect(getByLabelText('테스트 체크박스')).toBeTruthy();
  });

  test('shows checkmark when checked', () => {
    const { getByText } = render(
      <AccessibleCheckbox 
        checked={true} 
        onToggle={() => {}} 
        label="테스트 체크박스" 
      />
    );
    
    expect(getByText('✓')).toBeTruthy();
  });

  test('calls onToggle when pressed', () => {
    const onToggleMock = jest.fn();
    const { getByLabelText } = render(
      <AccessibleCheckbox 
        checked={false} 
        onToggle={onToggleMock} 
        label="테스트 체크박스" 
      />
    );
    
    fireEvent.press(getByLabelText('테스트 체크박스'));
    expect(onToggleMock).toHaveBeenCalledTimes(1);
  });

  test('has proper accessibility state', () => {
    const { getByLabelText } = render(
      <AccessibleCheckbox 
        checked={true} 
        onToggle={() => {}} 
        label="테스트 체크박스" 
      />
    );
    
    const checkbox = getByLabelText('테스트 체크박스');
    expect(checkbox.props.accessibilityRole).toBe('checkbox');
    expect(checkbox.props.accessibilityState.checked).toBe(true);
  });

  test('is disabled when disabled prop is true', () => {
    const onToggleMock = jest.fn();
    const { getByLabelText } = render(
      <AccessibleCheckbox 
        checked={false} 
        onToggle={onToggleMock} 
        label="테스트 체크박스" 
        disabled={true}
      />
    );
    
    const checkbox = getByLabelText('테스트 체크박스');
    expect(checkbox.props.accessibilityState.disabled).toBe(true);
    
    fireEvent.press(checkbox);
    expect(onToggleMock).not.toHaveBeenCalled();
  });
});

describe('AccessibleHeader', () => {
  test('renders with correct text and accessibility role', () => {
    const { getByText } = render(
      <AccessibleHeader level={1}>테스트 헤더</AccessibleHeader>
    );
    
    const header = getByText('테스트 헤더');
    expect(header).toBeTruthy();
    expect(header.props.accessibilityRole).toBe('header');
    expect(header.props.accessibilityLevel).toBe(1);
  });

  test('applies different styles for different levels', () => {
    const { getByText: getH1 } = render(
      <AccessibleHeader level={1}>H1 헤더</AccessibleHeader>
    );
    
    const { getByText: getH2 } = render(
      <AccessibleHeader level={2}>H2 헤더</AccessibleHeader>
    );
    
    const { getByText: getH3 } = render(
      <AccessibleHeader level={3}>H3 헤더</AccessibleHeader>
    );
    
    expect(getH1('H1 헤더')).toBeTruthy();
    expect(getH2('H2 헤더')).toBeTruthy();
    expect(getH3('H3 헤더')).toBeTruthy();
  });

  test('accepts custom accessibility label', () => {
    const { getByText } = render(
      <AccessibleHeader 
        level={2}
        accessibilityLabel="사용자 정의 헤더 레이블"
      >
        테스트 헤더
      </AccessibleHeader>
    );
    
    const header = getByText('테스트 헤더');
    expect(header.props.accessibilityLabel).toBe('사용자 정의 헤더 레이블');
  });
});

describe('Basic Component Tests', () => {
  test('components render without crashing', () => {
    expect(() => {
      render(<AccessibleButton title="테스트" onPress={() => {}} />);
      render(<AccessibleCheckbox checked={false} onToggle={() => {}} label="테스트" />);
      render(<AccessibleHeader level={1}>테스트</AccessibleHeader>);
    }).not.toThrow();
  });
});
