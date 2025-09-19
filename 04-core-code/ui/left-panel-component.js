// File: 04-core-code/ui/left-panel-component.js

/**
 * @fileoverview A dedicated component for managing and rendering the Left Panel UI.
 */
export class LeftPanelComponent {
    constructor(panelElement) {
        if (!panelElement) {
            throw new Error("Panel element is required for LeftPanelComponent.");
        }
        this.panelElement = panelElement;

        // --- DOM Element References within the Left Panel ---
        // K1 Panel
        this.locationButton = document.getElementById('btn-focus-location');
        this.locationInput = document.getElementById('location-input-box');
        
        // K2 Panel
        this.fabricColorButton = document.getElementById('btn-focus-fabric');
        this.lfButton = document.getElementById('btn-light-filter');
        this.lfDelButton = document.getElementById('btn-lf-del');

        // K3 Panel
        this.k3EditButton = document.getElementById('btn-k3-edit');
        this.k3OverButton = document.getElementById('btn-batch-cycle-over');
        this.k3OiButton = document.getElementById('btn-batch-cycle-oi');
        this.k3LrButton = document.getElementById('btn-batch-cycle-lr');
        
        // K4 Panel
        this.k4InputDisplay = document.getElementById('k4-input-display');
        this.k4DualButton = document.getElementById('btn-k4-dual');
        this.k4ChainButton = document.getElementById('btn-k4-chain');
        this.k4DualPriceValue = document.querySelector('#k4-dual-price-display .price-value');

        this.tabButtons = this.panelElement.querySelectorAll('.tab-button');
        this.tabContents = this.panelElement.querySelectorAll('.tab-content');
        
        console.log("LeftPanelComponent Initialized.");
    }

    render(uiState, quoteData) {
        this._updateTabStates(uiState);
        this._updatePanelButtonStates(uiState, quoteData);
    }

    _updateTabStates(uiState) {
        const { activeEditMode, activeTabId, k4ActiveMode } = uiState;
        const isInEditMode = activeEditMode !== null || k4ActiveMode !== null;

        const activeTabButton = document.getElementById(activeTabId);
        const activeContentTarget = activeTabButton ? activeTabButton.dataset.tabTarget : null;

        this.tabButtons.forEach(button => {
            button.classList.toggle('active', button.id === activeTabId);
            button.disabled = isInEditMode && button.id !== activeTabId;
        });

        this.tabContents.forEach(content => {
            const isThisContentActive = activeContentTarget && `#${content.id}` === activeContentTarget;
            content.classList.toggle('active', isThisContentActive);
        });
        
        const panelBgColors = {
            'k1-tab': 'var(--k1-bg-color)',
            'k2-tab': 'var(--k2-bg-color)',
            'k3-tab': 'var(--k3-bg-color)',
            'k4-tab': 'var(--k4-bg-color)',
            'k5-tab': 'var(--k5-bg-color)',
        };
        this.panelElement.style.backgroundColor = panelBgColors[activeTabId] || 'var(--k1-bg-color)';
    }

    _updatePanelButtonStates(uiState, quoteData) {
        const { activeEditMode, locationInputValue, lfModifiedRowIndexes, k4ActiveMode, k4DualPrice, targetCell, chainInputValue } = uiState;
        const { rollerBlindItems } = quoteData;

        // --- K1 Location Input State ---
        if (this.locationInput) {
            const isLocationActive = activeEditMode === 'K1';
            this.locationInput.disabled = !isLocationActive;
            this.locationInput.classList.toggle('active', isLocationActive);
            if (this.locationInput.value !== locationInputValue) {
                this.locationInput.value = locationInputValue;
            }
        }
        
        // --- K2 Button Active/Disabled States ---
        const isFCMode = activeEditMode === 'K2';
        const isLFSelectMode = activeEditMode === 'K2_LF_SELECT';
        const isLFDeleteMode = activeEditMode === 'K2_LF_DELETE_SELECT';
        const isAnyK2ModeActive = isFCMode || isLFSelectMode || isLFDeleteMode;

        if (this.locationButton) this.locationButton.classList.toggle('active', activeEditMode === 'K1');
        if (this.fabricColorButton) this.fabricColorButton.classList.toggle('active', isFCMode);
        if (this.lfButton) this.lfButton.classList.toggle('active', isLFSelectMode);
        if (this.lfDelButton) this.lfDelButton.classList.toggle('active', isLFDeleteMode);

        const hasBO1 = rollerBlindItems.some(item => item.fabricType === 'BO1');
        const hasLFModified = lfModifiedRowIndexes.size > 0;

        if (this.locationButton) this.locationButton.disabled = isAnyK2ModeActive;
        if (this.fabricColorButton) this.fabricColorButton.disabled = activeEditMode !== null && !isFCMode;
        if (this.lfButton) this.lfButton.disabled = (activeEditMode !== null && !isLFSelectMode) || !hasBO1;
        if (this.lfDelButton) this.lfDelButton.disabled = (activeEditMode !== null && !isLFDeleteMode) || !hasLFModified;

        // --- K3 Button Active/Disabled States ---
        const isK3EditMode = activeEditMode === 'K3';
        if (this.k3EditButton) {
            this.k3EditButton.classList.toggle('active', isK3EditMode);
            this.k3EditButton.disabled = activeEditMode !== null && !isK3EditMode;
        }
        const k3SubButtonsDisabled = !isK3EditMode;
        if (this.k3OverButton) this.k3OverButton.disabled = k3SubButtonsDisabled;
        if (this.k3OiButton) this.k3OiButton.disabled = k3SubButtonsDisabled;
        if (this.k3LrButton) this.k3LrButton.disabled = k3SubButtonsDisabled;

        // --- K4 Button Active/Disabled States ---
        if (this.k4DualButton) {
            const isDisabled = k4ActiveMode !== null && k4ActiveMode !== 'dual';
            this.k4DualButton.classList.toggle('active', k4ActiveMode === 'dual');
            this.k4DualButton.classList.toggle('disabled-by-mode', isDisabled);
            this.k4DualButton.disabled = isDisabled;
        }
        if (this.k4ChainButton) {
            const isDisabled = k4ActiveMode !== null && k4ActiveMode !== 'chain';
            this.k4ChainButton.classList.toggle('active', k4ActiveMode === 'chain');
            this.k4ChainButton.classList.toggle('disabled-by-mode', isDisabled);
            this.k4ChainButton.disabled = isDisabled;
        }
        
        // --- K4 Input and Price Display ---
        if (this.k4InputDisplay) {
            const isChainInputActive = k4ActiveMode === 'chain' && targetCell && targetCell.column === 'chain';
            this.k4InputDisplay.disabled = !isChainInputActive;
            this.k4InputDisplay.classList.toggle('active', isChainInputActive);
            if (this.k4InputDisplay.value !== chainInputValue) {
                this.k4InputDisplay.value = chainInputValue;
            }
        }
        if (this.k4DualPriceValue) {
            const newText = (typeof k4DualPrice === 'number') ? `$${k4DualPrice.toFixed(2)}` : '';
            if (this.k4DualPriceValue.textContent !== newText) {
                this.k4DualPriceValue.textContent = newText;
            }
        }
    }
}