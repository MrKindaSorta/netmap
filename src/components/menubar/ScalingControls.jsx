import React from 'react';
import { IconButton, Icon } from './MenuBarButton';

const ScaleControl = ({ scale, onDecrease, onIncrease, disabled, decreaseTitle, increaseTitle, theme }) => {
  return (
    <>
      <IconButton
        onClick={onDecrease}
        icon={<Icon d="M5 12h14" s={16} />}
        title={decreaseTitle}
        disabled={disabled}
        theme={theme}
      />
      <span className="px-2 text-xs font-medium w-12 text-center">{Math.round(scale * 100)}%</span>
      <IconButton
        onClick={onIncrease}
        icon={<Icon d="M12 5v14M5 12h14" s={16} />}
        title={increaseTitle}
        disabled={disabled}
        theme={theme}
      />
    </>
  );
};

const ScalingControls = ({
  circleScale,
  setCircleScale,
  deviceLabelScale,
  setDeviceLabelScale,
  portLabelScale,
  setPortLabelScale,
  viewMode,
  visibilityMode,
  theme
}) => {
  const isDisabled = viewMode === 'physical' && visibilityMode;

  return (
    <>
      <ScaleControl
        scale={circleScale}
        onDecrease={() => setCircleScale(s => Math.max(s - 0.1, 0.5))}
        onIncrease={() => setCircleScale(s => Math.min(s + 0.1, 2.5))}
        disabled={isDisabled}
        decreaseTitle="Shrink circles"
        increaseTitle="Grow circles"
        theme={theme}
      />
      <div className="w-px h-5" style={{ background: theme.border }} />
      <ScaleControl
        scale={deviceLabelScale}
        onDecrease={() => setDeviceLabelScale(s => Math.max(s - 0.1, 0.5))}
        onIncrease={() => setDeviceLabelScale(s => Math.min(s + 0.1, 2.5))}
        disabled={isDisabled}
        decreaseTitle="Shrink device labels (;)"
        increaseTitle="Grow device labels (')"
        theme={theme}
      />
      <div className="w-px h-5" style={{ background: theme.border }} />
      <ScaleControl
        scale={portLabelScale}
        onDecrease={() => setPortLabelScale(s => Math.max(s - 0.1, 0.5))}
        onIncrease={() => setPortLabelScale(s => Math.min(s + 0.1, 2.5))}
        disabled={isDisabled}
        decreaseTitle="Shrink port labels ({)"
        increaseTitle="Grow port labels (})"
        theme={theme}
      />
    </>
  );
};

export default ScalingControls;
