// File: 04-core-code/ui/views/k4-accessories-view.js

/**
 * @fileoverview A dedicated sub-view for handling all logic related to the K4 (Accessories) tab.
 */
export class K4AccessoriesView {
    constructor({ quoteService, uiService, calculationService, eventAggregator, publishStateChangeCallback }) {
        this.quoteService = quoteService;
        this.uiService = uiService;
        this.calculationService = calculationService;
        this.eventAggregator = eventAggregator;
        this.publish = publishStateChangeCallback;
        console.log("K4AccessoriesView Initialized.");
    }

    /**
     * Handles the toggling of K4 modes (dual, chain).
     * @param {object} data - The event data containing the mode.
     */
    handleK4ModeChange({ mode }) {
        const currentMode = this.uiService.getState().k4ActiveMode;

        if (currentMode === 'dual') {
            const items = this.quoteService.getItems();
            const dualCount = items.filter(item => item.dual === 'D').length;
            if (dualCount % 2 !== 0) {
                this.eventAggregator.publish('showNotification', {
                    message: '雙層支架(D)的總數必須為偶數，請修正後再退出。',
                    type: 'error'
                });
                return;
            }
            const price = this.calculationService.calculateDualPrice(items);
            this.uiService.setK4DualPrice(price);
        }

        const newMode = currentMode === mode ? null : mode;
        this.uiService.setK4ActiveMode(newMode);

        if (newMode === 'dual') {
            this.uiService.setK4DualPrice(null);
        }
        
        if (!newMode) {
            this.uiService.setTargetCell(null);
            this.uiService.clearChainInputValue();
        }

        this.publish();
    }

    /**
     * Handles the Enter key press in the chain input box.
     * @param {object} data - The event data containing the value.
     */
    handleK4ChainEnterPressed({ value }) {
        const { targetCell: currentTarget } = this.uiService.getState();
        if (!currentTarget) return;

        const valueAsNumber = Number(value);
        if (value !== '' && (!Number.isInteger(valueAsNumber) || valueAsNumber <= 0)) {
            this.eventAggregator.publish('showNotification', {
                message: '僅能輸入正整數。',
                type: 'error'
            });
            return;
        }

        const valueToSave = value === '' ? null : valueAsNumber;
        this.quoteService.updateItemProperty(currentTarget.rowIndex, currentTarget.column, valueToSave);
        
        this.uiService.setTargetCell(null);
        this.uiService.clearChainInputValue();
        this.publish();
    }

    /**
     * Handles clicks on table cells when a K4 mode is active.
     * @param {object} data - The event data { rowIndex, column }.
     */
    handleTableCellClick({ rowIndex, column }) {
        const { k4ActiveMode } = this.uiService.getState();
        const item = this.quoteService.getItems()[rowIndex];
        if (!item) return;

        if (k4ActiveMode === 'dual' && column === 'dual') {
            const newValue = item.dual === 'D' ? '' : 'D';
            this.quoteService.updateItemProperty(rowIndex, 'dual', newValue);
            this.publish();
        }

        if (k4ActiveMode === 'chain' && column === 'chain') {
            this.uiService.setTargetCell({ rowIndex, column: 'chain' });
            this.uiService.setChainInputValue(item.chain || '');
            this.publish();

            setTimeout(() => {
                const inputBox = document.getElementById('k4-input-display');
                inputBox?.focus();
                inputBox?.select();
            }, 50); 
        }
    }
    
    /**
     * This method is called by the main DetailConfigView when the K4 tab becomes active.
     */
    activate() {
        this.uiService.setVisibleColumns(['sequence', 'fabricTypeDisplay', 'location', 'dual', 'chain']);
        this.publish();
    }
}