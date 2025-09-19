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
        k1LocationView,
        k2FabricView
    }) {
        this.quoteService = quoteService;
        this.uiService = uiService;
        this.calculationService = calculationService;
        this.eventAggregator = eventAggregator;
        this.publish = publishStateChangeCallback;

        // Store instances of sub-views
        this.k1View = k1LocationView;
        this.k2View = k2FabricView;
        // Future sub-views (k3, k4) will be added here

        this.eventAggregator.subscribe('k4ModeChanged', (data) => this.handleK4ModeChange(data));
        
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
            case 'k2-tab':
                this.k2View.activate();
                break;
            // Future cases for k3, k4, k5 will be added here
            default:
                // Fallback for tabs not yet refactored
                break;
        }
    }
    
    handleFocusModeRequest({ column }) {
        if (column === 'location') {
            this.k1View.handleFocusModeRequest();
            return;
        }
        if (column === 'fabric') {
            this.k2View.handleFocusModeRequest();
            return;
        }
    }
    
    handleLocationInputEnter({ value }) {
        this.k1View.handleLocationInputEnter({ value });
    }

    handlePanelInputBlur({ type, field, value }) {
        this.k2View.handlePanelInputBlur({ type, field, value });
    }

    handlePanelInputEnter() {
        this.k2View.handlePanelInputEnter();
    }

    handleSequenceCellClick({ rowIndex }) {
        const { activeEditMode } = this.uiService.getState();

        if (activeEditMode === 'K1') {
            // This is handled by handleTableCellClick for K1
            return;
        }

        if (activeEditMode === 'K2_LF_SELECT' || activeEditMode === 'K2_LF_DELETE_SELECT') {
            this.k2View.handleSequenceCellClick({ rowIndex });
        }
    }

    handleLFEditRequest() {
        this.k2View.handleLFEditRequest();
    }

    handleLFDeleteRequest() {
        this.k2View.handleLFDeleteRequest();
    }
    
    handleTableCellClick({ rowIndex, column }) {
        const { activeEditMode, k4ActiveMode } = this.uiService.getState();
        
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
    
    handleToggleK3EditMode() {
        // To be moved to k3-view
    }

    handleBatchCycle({ column }) {
        // To be moved to k3-view
    }

    initializePanelState() {
        // This might become a delegator to the active tab's view
        this.k2View._updatePanelInputsState(); // Initial state is likely K2 related
    }
}