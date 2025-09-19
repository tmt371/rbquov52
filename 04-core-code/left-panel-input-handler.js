// File: 04-core-code/left-panel-input-handler.js

/**
 * @fileoverview A dedicated input handler for all user interactions within the Left Panel.
 */
export class LeftPanelInputHandler {
    constructor(eventAggregator) {
        this.eventAggregator = eventAggregator;
        console.log("LeftPanelInputHandler Initialized.");
    }

    initialize() {
        this._setupNavigationToggle();
        this._setupTabButtons();
        this._setupK1Inputs();
        this._setupK2Inputs();
        this._setupK3Inputs();
        this._setupK4Inputs();
        this._setupK5Inputs();
    }

    _setupNavigationToggle() {
        const leftPanelToggle = document.getElementById('left-panel-toggle');
        if (leftPanelToggle) {
            leftPanelToggle.addEventListener('click', () => {
                this.eventAggregator.publish('userNavigatedToDetailView');
            });
        }
    }

    _setupTabButtons() {
        const tabContainer = document.querySelector('.tab-container');
        if (tabContainer) {
            tabContainer.addEventListener('click', (event) => {
                const target = event.target.closest('.tab-button');
                if (target && !target.disabled) {
                    this.eventAggregator.publish('userSwitchedTab', { tabId: target.id });
                }
            });
        }
    }

    _setupK1Inputs() {
        const locationButton = document.getElementById('btn-focus-location');
        if (locationButton) {
            locationButton.addEventListener('click', () => {
                this.eventAggregator.publish('userRequestedFocusMode', { column: 'location' });
            });
        }

        const locationInput = document.getElementById('location-input-box');
        if (locationInput) {
            locationInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    this.eventAggregator.publish('locationInputEnterPressed', {
                        value: event.target.value
                    });
                }
            });
        }
    }

    _setupK2Inputs() {
        const fabricButton = document.getElementById('btn-focus-fabric');
        if (fabricButton) {
            fabricButton.addEventListener('click', () => {
                this.eventAggregator.publish('userRequestedFocusMode', { column: 'fabric' });
            });
        }
        const lfButton = document.getElementById('btn-light-filter');
        if (lfButton) {
            lfButton.addEventListener('click', () => {
                this.eventAggregator.publish('userRequestedLFEditMode');
            });
        }
        const lfDelButton = document.getElementById('btn-lf-del');
        if (lfDelButton) {
            lfDelButton.addEventListener('click', () => {
                this.eventAggregator.publish('userRequestedLFDeleteMode');
            });
        }

        const batchTable = document.getElementById('fabric-batch-table');
        if (batchTable) {
            batchTable.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' && event.target.matches('.panel-input')) {
                    event.preventDefault();
                    const input = event.target;
                    this.eventAggregator.publish('panelInputEnterPressed', {
                        type: input.dataset.type,
                        field: input.dataset.field,
                        value: input.value
                    });
                }
            });
            batchTable.addEventListener('blur', (event) => {
                if (event.target.matches('.panel-input')) {
                    this.eventAggregator.publish('panelInputBlurred', {
                        type: event.target.dataset.type,
                        field: event.target.dataset.field,
                        value: event.target.value
                    });
                }
            }, true);
        }
    }

    _setupK3Inputs() {
        const editButton = document.getElementById('btn-k3-edit');
        if (editButton) {
            editButton.addEventListener('click', () => {
                this.eventAggregator.publish('userToggledK3EditMode');
            });
        }

        const setupBatchCycleButton = (buttonId, column) => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', () => {
                    this.eventAggregator.publish('userRequestedBatchCycle', { column });
                });
            }
        };
        setupBatchCycleButton('btn-batch-cycle-over', 'over');
        setupBatchCycleButton('btn-batch-cycle-oi', 'oi');
        setupBatchCycleButton('btn-batch-cycle-lr', 'lr');
    }

    _setupK4Inputs() {
        const setupK4Button = (buttonId, mode) => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', () => {
                    this.eventAggregator.publish('k4ModeChanged', { mode });
                });
            }
        };
        setupK4Button('btn-k4-dual', 'dual');
        setupK4Button('btn-k4-chain', 'chain');

        const k4Input = document.getElementById('k4-input-display');
        if (k4Input) {
            k4Input.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    this.eventAggregator.publish('k4ChainEnterPressed', {
                        value: event.target.value
                    });
                }
            });
        }
    }

    _setupK5Inputs() {
        const returnButton = document.getElementById('btn-return-form1');
        if (returnButton) {
            returnButton.addEventListener('click', () => {
                this.eventAggregator.publish('userNavigatedToQuickQuoteView');
            });
        }
    }
}