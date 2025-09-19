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
        k2FabricView,
        k3OptionsView,
        k4AccessoriesView
    }) {
        this.quoteService = quoteService;
        this.uiService = uiService;
        this.calculationService = calculationService;
        this.eventAggregator = eventAggregator;
        this.publish = publishStateChangeCallback;

        // Store instances of sub-views
        this.k1View = k1LocationView;
        this.k2View = k2FabricView;
        this.k3View = k3OptionsView;
        this.k4View = k4AccessoriesView;

        // These events are now handled by their respective sub-views
        // this.eventAggregator.subscribe('k4ModeChanged', (data) => this.handleK4ModeChange(data));
        
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
            case 'k3-tab':
                this.k3View.activate();
                break;
            case 'k4-tab':
                this.k4View.activate();
                break;
            // Future cases for k5 will be added here
            default:
                break;
        }
    }
    
    // The events below are now delegated to the specific sub-view that handles them
    // The AppController will be responsible for routing these events correctly.
    // (Note: For this refactoring step, we assume AppController will be updated to route these)

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
    
    handleToggleK3EditMode() {
        this.k3View.handleToggleK3EditMode();
    }

    handleBatchCycle({ column }) {
        this.k3View.handleBatchCycle({ column });
    }

    handleK4ModeChange({ mode }) {
        this.k4View.handleK4ModeChange({ mode });
    }

    handleK4ChainEnterPressed({ value }) {
        this.k4View.handleK4ChainEnterPressed({ value });
    }

    handleTableCellClick({ rowIndex, column }) {
        const { activeEditMode, k4ActiveMode } = this.uiService.getState();
        
        if (activeEditMode === 'K1') {
            this.k1View.handleTableCellClick({ rowIndex });
            return;
        }
        
        if (activeEditMode === 'K3') {
            this.k3View.handleTableCellClick({ rowIndex, column });
            return;
        }

        if (k4ActiveMode) {
            this.k4View.handleTableCellClick({ rowIndex, column });
            return;
        }
    }
    
    initializePanelState() {
        // This is primarily for K2, so delegate to it.
        // In a more advanced setup, this could ask the active tab's view to initialize.
        this.k2View._updatePanelInputsState();
    }
}