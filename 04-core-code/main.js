// File: 04-core-code/main.js

import { EventAggregator } from './event-aggregator.js';
import { ConfigManager } from './config-manager.js';
import { InputHandler } from './input-handler.js';
import { UIManager } from './ui/ui-manager.js';
import { AppController } from './app-controller.js';

import { initialState } from './config/initial-state.js';
import { ProductFactory } from './strategies/product-factory.js';

import { QuoteService } from './services/quote-service.js';
import { CalculationService } from './services/calculation-service.js';
import { FocusService } from './services/focus-service.js';
import { FileService } from './services/file-service.js';
import { UIService } from './services/ui-service.js';

import { QuickQuoteView } from './ui/views/quick-quote-view.js';
import { DetailConfigView } from './ui/views/detail-config-view.js';
import { K1LocationView } from './ui/views/k1-location-view.js';
import { K2FabricView } from './ui/views/k2-fabric-view.js';
import { K3OptionsView } from './ui/views/k3-options-view.js';
import { K4AccessoriesView } from './ui/views/k4-accessories-view.js';
import { QuickQuoteFileHandler } from './ui/views/quick-quote-file-handler.js'; // [REFACTOR] Import the new handler


const AUTOSAVE_STORAGE_KEY = 'quoteAutoSaveData';

class App {
    constructor() {
        let startingState = JSON.parse(JSON.stringify(initialState));
        try {
            const autoSavedDataJSON = localStorage.getItem(AUTOSAVE_STORAGE_KEY);
            if (autoSavedDataJSON) {
                const message = "It looks like you have unsaved work from a previous session.\n\n- 'OK' to restore the unsaved work.\n- 'Cancel' to start a new, blank quote.";
                if (window.confirm(message)) {
                    const autoSavedData = JSON.parse(autoSavedDataJSON);
                    startingState.quoteData = autoSavedData;
                    console.log("Restored data from auto-save.");
                } else {
                    localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
                    console.log("Auto-saved data discarded by user.");
                }
            }
        } catch (error) {
            console.error("Failed to process auto-saved data:", error);
            localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
        }
        
        this.eventAggregator = new EventAggregator();
        this.configManager = new ConfigManager(this.eventAggregator);
        
        const productFactory = new ProductFactory();

        // Services are instantiated here...
        const quoteService = new QuoteService({
            initialState: startingState,
            productFactory: productFactory
        });
        const calculationService = new CalculationService({
            productFactory: productFactory,
            configManager: this.configManager
        });
        const fileService = new FileService();
        const uiService = new UIService(startingState.ui);
        const focusService = new FocusService({
            uiService: uiService,
            quoteService: quoteService
        });

        const publishStateChangeCallback = () => this.eventAggregator.publish('stateChanged', this.appController._getFullState());

        // [REFACTOR] Instantiate the sub-handler for QuickQuoteView
        const quickQuoteFileHandler = new QuickQuoteFileHandler({
            quoteService,
            fileService,
            eventAggregator: this.eventAggregator
        });

        const quickQuoteView = new QuickQuoteView({
            quoteService,
            calculationService,
            focusService,
            fileService,
            uiService,
            eventAggregator: this.eventAggregator,
            productFactory,
            publishStateChangeCallback,
            quickQuoteFileHandler: quickQuoteFileHandler // [REFACTOR] Inject the handler
        });

        // [REFACTOR] Instantiate the sub-views for DetailConfigView
        const k1LocationView = new K1LocationView({
            quoteService,
            uiService,
            publishStateChangeCallback
        });

        const k2FabricView = new K2FabricView({
            quoteService,
            uiService,
            eventAggregator: this.eventAggregator,
            publishStateChangeCallback
        });

        const k3OptionsView = new K3OptionsView({
            quoteService,
            uiService,
            publishStateChangeCallback
        });

        const k4AccessoriesView = new K4AccessoriesView({
            quoteService,
            uiService,
            calculationService,
            eventAggregator: this.eventAggregator,
            publishStateChangeCallback
        });

        const detailConfigView = new DetailConfigView({
            quoteService,
            uiService,
            calculationService,
            eventAggregator: this.eventAggregator,
            publishStateChangeCallback,
            k1LocationView: k1LocationView,
            k2FabricView: k2FabricView,
            k3OptionsView: k3OptionsView,
            k4AccessoriesView: k4AccessoriesView
        });
        
        this.appController = new AppController({
            eventAggregator: this.eventAggregator,
            uiService,
            quoteService,
            fileService,
            quickQuoteView,
            detailConfigView
        });
        
        // UIManager and InputHandler are instantiated after HTML is loaded
    }

    async _loadPartials() {
        try {
            const response = await fetch('./04-core-code/ui/partials/left-panel.html');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            document.body.insertAdjacentHTML('beforeend', html);
        } catch (error) {
            console.error("Failed to load HTML partial:", error);
            this.eventAggregator.publish('showNotification', { message: 'Error: Could not load UI components!', type: 'error'});
        }
    }

    async run() {
        console.log("Application starting...");
        
        await this._loadPartials(); // Load HTML first

        this.inputHandler = new InputHandler(this.eventAggregator);
        this.uiManager = new UIManager(
            document.getElementById('app'), 
            this.eventAggregator
        );

        await this.configManager.initialize();

        this.eventAggregator.subscribe('stateChanged', (state) => {
            this.uiManager.render(state);
        });
        
        this.appController.publishInitialState(); 
        this.inputHandler.initialize(); 
        console.log("Application running and interactive.");
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const app = new App();
    await app.run();
});