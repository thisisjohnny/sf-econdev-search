public with sharing class SiteController {
    @AuraEnabled(Cacheable=true)
    public static List<Site__c> getAllSites(){
        List<Site__c> siteList = new List<Site__c>();
        String queryString = 'SELECT Id, Name, Street_Address__c, City__c, State__c, Postal_Zip_Code__c, Historical_Site__c, Plot_Size_Acreage__c, Interior_Square_Footage__c, Opportunity_Zone__c, Zoning__c, Site_Status_Condition__c, Property_Value__c, Latitude__c, Longitude__c FROM Site__c LIMIT 2000';

        try {
            siteList = Database.query(queryString);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }

        return siteList;
    }

    @AuraEnabled(Cacheable=true)
    public static List<Site__c> searchSites(String siteName, String statusCondition, String zoning, String city, String state, Double squareFootage, Double plotSizeAcreage){
        List<Site__c> siteList = new List<Site__c>();
        String queryString = 'SELECT Id, Name, Street_Address__c, City__c, State__c, Postal_Zip_Code__c, Historical_Site__c, Plot_Size_Acreage__c, Interior_Square_Footage__c, Opportunity_Zone__c, Zoning__c, Site_Status_Condition__c, Property_Value__c, Latitude__c, Longitude__c FROM Site__c ';
        Boolean isFirst = true;
        
        siteName = siteName.trim();
        statusCondition = statusCondition.trim();
        zoning = zoning.trim();
        city = city.trim();
        state = state.trim();
        squareFootage = squareFootage;
        plotSizeAcreage = plotSizeAcreage;
        
        if (siteName == '' && 
            statusCondition == '' && 
            zoning == '' && 
            city == '' && 
            state == '' && 
            squareFootage == 0 && 
            plotSizeAcreage == 0) 
        {
            return getAllSites();
        } else {
            if (siteName != '') { 
                queryString = queryString + 'WHERE Name = :siteName'; 
                isFirst = false;
            }
            if (statusCondition != '') {
                if (isFirst == true) {
                    queryString = queryString + 'WHERE Site_Status_Condition__c = :statusCondition';
                    isFirst = false;
                } else {
                    queryString = queryString + ' AND Site_Status_Condition__c = :statusCondition';
                }
            }
            if (zoning != '') {
                if (isFirst == true) {
                    queryString = queryString + 'WHERE Zoning__c = :zoning';
                    isFirst = false;
                } else {
                    queryString = queryString + ' AND Zoning__c = :zoning';
                }
            }
            if (city != '') {
                if (isFirst == true) {
                    queryString = queryString + 'WHERE City__c = :city';
                    isFirst = false;
                } else {
                    queryString = queryString + ' AND City__c = :city';
                }
            }
            if (state != '') {
                if (isFirst == true) {
                    queryString = queryString + 'WHERE State__c = :state';
                    isFirst = false;
                } else {
                    queryString = queryString + ' AND State__c = :state';
                }
            }
            if (squareFootage != 0) {
                if (isFirst == true) {
                    queryString = queryString + 'WHERE Interior_Square_Footage__c <= :squareFootage';
                    isFirst = false;
                } else {
                    queryString = queryString + ' AND Interior_Square_Footage__c <= :squareFootage';
                }
            }
            if (plotSizeAcreage != 0) {
                if (isFirst == true) {
                    queryString = queryString + 'WHERE Plot_Size_Acreage__c <= :plotSizeAcreage';
                    isFirst = false;
                } else {
                    queryString = queryString + ' AND Plot_Size_Acreage__c <= :plotSizeAcreage';
                }
            }
        }

        try {
            siteList = Database.query(queryString + ' LIMIT 2000');
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }

        return siteList;
    }
}
