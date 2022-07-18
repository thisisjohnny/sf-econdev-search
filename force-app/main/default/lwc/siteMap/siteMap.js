import { LightningElement, wire } from 'lwc';
import { subscribe, unsubscribe, MessageContext } from 'lightning/messageService';
import SITE_LIST_UPDATE_MESSAGE from '@salesforce/messageChannel/SiteListUpdate__c';

export default class SiteMap extends LightningElement {
    mapMarkers = [
        {
            location: { Street: '415 Mission St', City: 'San Francisco', State: 'CA' },
            title: 'Salesforce Tower',
            description: 'Salesforce Tower is a 1,070-foot (326m) office skyscraper in the South of Market district of downtown San Francisco.',
            icon: 'standard:location'
        }
    ];
    subscription = null;

    @wire(MessageContext) messageContext;

    connectedCallback() {
        this.subscription = subscribe(
            this.messageContext,
            SITE_LIST_UPDATE_MESSAGE,
            (message) => {
                this.handleSiteListUpdate(message);
            }
        );
    }

    disconnectedCallback() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    handleSiteListUpdate(message) {
        this.mapMarkers = message.sites.map(site => {
            return {
                location: { Street: site.Street_Address__c , City: site.City__c, State: site.State__c },
                title: site.Name,
                description: `<b>Stats/Condition:</b> ${site.Site_Status_Condition__c}<br /><b>Zoning:</b> ${site.Zoning__c}<br /><b>Property Value:</b> ${site.Property_Value__c}<br /><b>Plot Size Acreage:</b> ${site.Plot_Size_Acreage__c}<br /><b>Int. Sq. Footage:</b> ${site.Interior_Square_Footage__c}`,
                icon: 'custom:custom85'
            }
        });
    }
}