// File: 04-core-code/ui/views/quick-quote-file-handler.js

/**
 * @fileoverview A dedicated handler for file-related actions in the Quick Quote view.
 */
export class QuickQuoteFileHandler {
    constructor({ quoteService, fileService, eventAggregator }) {
        this.quoteService = quoteService;
        this.fileService = fileService;
        this.eventAggregator = eventAggregator;
        console.log("QuickQuoteFileHandler Initialized.");
    }

    /**
     * Handles the logic for saving the current quote to a JSON file.
     */
    handleSaveToFile() {
        const quoteData = this.quoteService.getQuoteData();
        const result = this.fileService.saveToJson(quoteData);
        const notificationType = result.success ? 'info' : 'error';
        this.eventAggregator.publish('showNotification', { message: result.message, type: notificationType });
    }

    /**
     * Handles the logic for exporting the current quote to a CSV file.
     */
    handleExportCSV() {
        const quoteData = this.quoteService.getQuoteData();
        const result = this.fileService.exportToCsv(quoteData);
        const notificationType = result.success ? 'info' : 'error';
        this.eventAggregator.publish('showNotification', { message: result.message, type: notificationType });
    }

    /**
     * Handles the logic for saving the current quote and then triggering a file load.
     */
    handleSaveThenLoad() {
        this.handleSaveToFile();
        this.eventAggregator.publish('triggerFileLoad');
    }
}