// File: 04-core-code/ui/views/detail-config-view.js

/**
 * @fileoverview A "Manager" view that delegates logic to specific sub-views for each tab.
 */
export class DetailConfigView {
    constructor({ 
        quoteService, 
        uiService, 
        calculationService, 
        eventAggregator, 
        publishStateChangeCallback,
        // Sub-views are injected here
        k1LocationView 
    }) {
        this.quoteService = quoteService;
        this.uiService = uiService;
        this.calculationService = calculationService;
        this.eventAggregator = eventAggregator;
        this.publish = publishStateChangeCallback;

        // Store instances of sub-views
        this.k1View = k1LocationView;
        // Future sub-views (k2, k3, k4) will be added here

        this.eventAggregator.subscribe('k4ModeChanged', (data) => this.handleK4ModeChange(data));
        // The subscription for 'k4ChainEnterPressed' is removed as it will be handled by the future K4 sub-view
        // The subscription for 'numericKeyPressed' is also removed for the same reason
        
        console.log("DetailConfigView Refactored as a Manager View.");
    }

    // --- Event Handlers that need to delegate to sub-views ---

    /**
     * Activates the logic for a specific tab. Called by AppController.
     * @param {string} tabId The ID of the tab to activate (e.g., 'k1-tab').
     */
    activateTab(tabId) {
        switch (tabId) {
            case 'k1-tab':
                this.k1View.activate();
                break;
            // Future cases for k2, k3, k4, k5 will be added here
            default:
                // Fallback for tabs not yet refactored
                break;
        }
    }
    
    handleFocusModeRequest({ column }) {
        // Delegate to the appropriate sub-view based on the column
        if (column === 'location') {
            this.k1View.handleFocusModeRequest();
            return;
        }

        // Logic for K2 (to be refactored)
        const currentMode = this.uiService.getState().activeEditMode;
        if (column === 'fabric') {
            const newMode = currentMode === 'K2' ? null : 'K2';

            if (newMode) {
                const items = this.quoteService.getItems();
                const { lfModifiedRowIndexes } = this.uiService.getState();
                const hasConflict = items.some((item, index) => 
                    item.fabricType === 'BO1' && lfModifiedRowIndexes.has(index)
                );

                if (hasConflict) {
                    this.eventAggregator.publish('showConfirmationDialog', {
                        message: 'Some BO1 items have Light-Filter settings. Continuing will overwrite this data. Proceed?',
                        buttons: [
                            { text: 'OK', callback: () => this._enterFCMode(true) },
                            { text: 'Cancel', className: 'secondary', callback: () => {} }
                        ]
                    });
                } else {
                    this._enterFCMode(false);
                }
            } else {
                this.uiService.setActiveEditMode(null);
                this._updatePanelInputsState();
                this.publish();
            }
        } 
    }
    
    handleLocationInputEnter({ value }) {
        // This event is specific to K1, so we delegate it directly.
        this.k1View.handleLocationInputEnter({ value });
    }
    
    handleTableCellClick({ rowIndex, column }) {
        const { activeEditMode, k4ActiveMode } = this.uiService.getState();
        
        // Delegate to K1 sub-view if K1 mode is active
        if (activeEditMode === 'K1') {
            this.k1View.handleTableCellClick({ rowIndex });
            return;
        }

        const item = this.quoteService.getItems()[rowIndex];
        if (!item) return;

        // Logic for K3 (to be refactored)
        if (activeEditMode === 'K3' && ['over', 'oi', 'lr'].includes(column)) {
            this.uiService.setActiveCell(rowIndex, column);
            this.quoteService.cycleK3Property(rowIndex, column);
            this.publish();
            
            setTimeout(() => {
                this.uiService.setActiveCell(null, null);
                this.publish();
            }, 150);
        }

        // Logic for K4 (to be refactored)
        if (k4ActiveMode === 'dual' && column === 'dual') {
            const newValue = item.dual === 'D' ? '' : 'D';
            this.quoteService.updateItemProperty(rowIndex, 'dual', newValue);
            this.publish();
        }

        if (k4ActiveMode === 'chain' && column === 'chain') {
            // Logic to be moved to k4-view
        }
    }
    
    // --- Logic to be refactored and moved to respective sub-views ---
    
    handleK4ModeChange({ mode }) {
        // This will be moved to k4-view
    }

    handleK4ChainEnterPressed({ value }) {
        // This will be moved to k4-view
    }

    // --- Methods below this line will eventually be moved to their respective sub-views ---

    _enterFCMode(isOverwriting) {
        // To be moved to k2-view
    }

    handlePanelInputBlur({ type, field, value }) {
        // To be moved to k2-view
    }

    handlePanelInputEnter() {
        // To be moved to k2-view
    }

    handleSequenceCellClick({ rowIndex }) {
        // To be moved to k2-view
    }
    
    handleLFEditRequest() {
        // To be moved to k2-view
    }

    handleLFDeleteRequest() {
        // To be moved to k2-view
    }
    
    handleToggleK3EditMode() {
        // To be moved to k3-view
    }

    handleBatchCycle({ column }) {
        // To be moved to k3-view
    }



    initializePanelState() {
        this._updatePanelInputsState();
    }

    _updatePanelInputsState() {
        // To be moved to k2-view
    }
}