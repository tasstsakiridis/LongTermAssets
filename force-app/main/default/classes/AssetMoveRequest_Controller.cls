public with sharing class AssetMoveRequest_Controller {
    @AuraEnabled 
    public static String getRecordType(Id recordId) {
        if (recordId == null) { return ''; }
        return recordId.getSobjectType().getDescribe().getName();
    }
    
    @AuraEnabled(cacheable=true)
    public static Account getAccount(String accountId) {
        return [SELECT Id, Name, AccountNumber, ShippingStreet, ShippingState, ShippingCity, ShippingPostalCode, ShippingCountry
                  FROM Account 
                 WHERE Id =:accountId];
    }

    @AuraEnabled(cacheable=true)
    public static List<Account> getMyAccounts(String accountName) {
        String soql = 'SELECT Id, Name, AccountNumber, ShippingStreet, ShippingState, ShippingCity, ShippingPostalCode, ShippingCountry,';
        soql += ' (SELECT Id, Name, Serial__c, RecordTypeId, RecordType.Name, Image_Name__c FROM Assets__r) ';
        soql += ' FROM Account';
        if (accountName != null && accountName != '') {
            soql += ' WHERE Name LIKE \'%' + accountName + '%\'';
        }
        return Database.query(soql);
    }

    @AuraEnabled(cacheable=true)
    public static Asset_Move__c getMoveRequest(String moveId) {
        return [SELECT Id, Name, RecordTypeId, RecordType.Name, Account__c, Account__r.Name, Asset__c, Asset_Model__c, Asset_Serial__c, Comments__c, Completed_Date__c,
                       Completion_Comments__c, Contact__c, Contact_Mobile__c, Contact__r.Name, Contact_Telephone__c, Contact_Phone_Number__c,
                       Is_Full_Access_Granted__c, Is_Placement__c, Is_Powersource_Easily_Accessible__c, Move_Complete__c, New_Account__c,
                       New_Account_Name__c, Pick_Up_Date__c, Status__c, Terms_Conditions__c, Terms_Emailed__c
                  FROM Asset_Move__c 
                 WHERE Id =:moveId];
    }

    @AuraEnabled(cacheable=true)
    public static List<Asset__c> getAssets(String type) {
        return [SELECT Id, Name, Serial__c, RecordTypeId, RecordType.Name, Image_Name__c 
                  FROM Asset__c 
                 WHERE Is_Active__c = true
                   AND Account__r.Is_Asset_Maintenance_Account__c = true];
    }

    @AuraEnabled(cacheable=true) 
    public static Asset__c getAsset(String assetId) {
        return [SELECT Id, Name, Serial__c, Image_Name__c 
                  FROM Asset__c 
                 WHERE Id =:assetId];
    }
}
