import { LightningElement, wire, api } from 'lwc';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import { publish, MessageContext } from 'lightning/messageService';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { FlowAttributeChangeEvent } from 'lightning/flowSupport';
import SITE_OBJECT from '@salesforce/schema/Site__c';
import SITE_LIST_UPDATE_MESSAGE from '@salesforce/messageChannel/SiteListUpdate__c';
import searchSites from '@salesforce/apex/SiteController.searchSites';
import ZONING_FIELD from '@salesforce/schema/Site__c.Zoning__c';
import STATUS_CONDITION_FIELD from '@salesforce/schema/Site__c.Site_Status_Condition__c';

const actions = [
    { label: 'Navigate to Details', name: 'navigate_details' }
]
const columns = [
    { label: 'Site Name', fieldName: 'Name' },
    { label: 'Site Status/Condition', fieldName: 'Site_Status_Condition__c' },
    { label: 'Street Address', fieldName: 'Street_Address__c' },
    { label: 'City', fieldName: 'City__c' },
    { type: 'action', typeAttributes: { rowActions: actions } }
]

export default class SiteList extends NavigationMixin(LightningElement) {
    @api showCheckbox;
    cols = columns;
    isLoading = false;
    error;
    sites = undefined;
    defaultRecordTypeId = '';
    zoningOptions = [];
    statusConditionOptions = [];
    siteNameString = '';
    selectedStatusCondition = '';
    selectedZoning = '';
    cityString = '';
    stateString = '';
    maxSquareFootage = undefined;
    maxPlotSizeAcreage = undefined;
    record = {};
    _selectedProperties = [];
    @api
    get selectedProperties() {
        return this._selectedProperties;
    }

    @wire(MessageContext) messageContext;

    @wire(getObjectInfo, { objectApiName: SITE_OBJECT })
    objectInfo({data, error}) {
        if(data) {
            this.defaultRecordTypeId = data.defaultRecordTypeId;
        } else if (error) {
            console.log('Error getting record type information for the Site__c object');
        }
    }

    @wire(getPicklistValues, { recordTypeId: "$defaultRecordTypeId", fieldApiName: STATUS_CONDITION_FIELD })
    setStatusConditionOptions({error, data}) {
        if (data) {
            this.statusConditionOptions = data.values;
        } else if (error) {
            console.log('Error getting status condition options: ' + error);
        }
    }
    
    @wire(getPicklistValues, { recordTypeId: "$defaultRecordTypeId", fieldApiName: ZONING_FIELD })
    setZoningOptions({error, data}) {
        if (data) {
            this.zoningOptions = data.values;
        } else if (error) {
            console.log('Error getting zoning options: ' + error);
        }
    }

    handleSiteNameChange(event) {
        this.siteNameString = event.target.value;
    }

    handleStatusConditionChange(event) {
        this.selectedStatusCondition = event.target.value;
    }

    handleZoningChange(event) {
        this.selectedZoning = event.target.value;
    }

    handleCityChange(event) {
        this.cityString = event.target.value;
    }

    handleStateChange(event) {
        this.stateString = event.target.value;
    }

    handleMaxSquareFootageChange(event) {
        this.maxSquareFootage = event.target.value;
    }

    handleMaxPlotSizeAcreageChange(event) {
        this.maxPlotSizeAcreage = event.target.value;
    }

    handleSearch() {
        searchSites({
            siteName : this.siteNameString, 
            statusCondition : this.selectedStatusCondition, 
            zoning : this.selectedZoning, 
            city : this.cityString, 
            state : this.stateString, 
            squareFootage : this.maxSquareFootage,
            plotSizeAcreage : this.maxPlotSizeAcreage
        })
        .then(result => {
            console.log('returning search results');
            this.sites = result;

            if (result) {
                const message = { sites: result };
                publish(this.messageContext, SITE_LIST_UPDATE_MESSAGE, message);
            }
        })
        .catch(error => {
            console.log('there was an error: ' + error.body.message);
            this.sites = undefined;
            if (error) {
                this.error = error.body.message;
            }
        })
    }

    handleClear() {
        this.siteNameString = '';
        this.selectedStatusCondition = '';
        this.selectedZoning = '';
        this.cityString = '';
        this.stateString = '';
        this.maxSquareFootage = undefined;
        this.maxPlotSizeAcreage = undefined;
        this.sites = undefined;
    }

    handleRowAction(event) {
        event.preventDefault();
        
        const row = event.detail.row;
        this.record = row;
        let recordId = this.record.Id;

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: 'Site__c',
                actionName: 'view',
            }
        });
    }

    handleRowSelect(event) {
        const rows = event.detail.selectedRows;
        for (let i = 0; i < rows.length; i++) {
            this._selectedProperties = rows[i].Id;
        }
        console.log(this._selectedProperties);
        const attributeChangeEvent = new FlowAttributeChangeEvent('selectedProperties', this._selectedProperties);
        this.dispatchEvent(attributeChangeEvent);
    }
}