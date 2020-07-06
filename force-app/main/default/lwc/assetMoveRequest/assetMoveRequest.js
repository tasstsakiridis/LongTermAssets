import { LightningElement, api, wire } from 'lwc';

//import getAccount from '@salesforce/apex/AssetMoveRequest_Controller.getAccount';
//import getMoveRequest from '@salesforce/apex/AssetMoveRequest_Controller.getMoveRequest';
import getMyAccounts from '@salesforce/apex/AssetMoveRequest_Controller.getMyAccounts';
import getAssets from '@salesforce/apex/AssetMoveRequest_Controller.getAssets';

import OBJECT_ACCOUNT from '@salesforce/schema/Account';
import OBJECT_ASSET from '@salesforce/schema/Asset__c';
import OBJECT_ASSET_MODEL from '@salesforce/schema/Asset_Models__c';
import OBJECT_ASSET_MOVE from '@salesforce/schema/Asset_Move__c';

import LABEL_NEW from '@salesforce/label/c.New';
import LABEL_MOVE_REQUEST from '@salesforce/label/c.Move_Request';
import LABEL_CANCEL from '@salesforce/label/c.Cancel';
import LABEL_SAVE from '@salesforce/label/c.Save';
import LABEL_NEXT from '@salesforce/label/c.Next';
import LABEL_PREV from '@salesforce/label/c.Prev';
import LABEL_SEARCH from '@salesforce/label/c.Search';

const assetTypeOptions = [
    { label: 'Fridge', value: 'Asset' },
    { label: 'Long Term', value: 'Long Term' },
];
const placementPickupOptions = [
    { label: 'Placement', value: 'placement' },
    { label: 'Pickup', value: 'pickup' }
];
const placementTypeOptions = [
    { label: 'New placement', value: 'new' },
    { label: 'Move asset between accounts', value: 'account' } 
];
const yesNoOptions = [
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' }
];

export default class AssetMoveRequest extends LightningElement {
    labels = {
        assetType: { label: 'Asset Type' },
        requestType: { label: 'What type of asset are you moving?' },
        new: { label: 'New' },
        moveRequest: { label: 'Move Request' },
        cancel: { label: LABEL_CANCEL },
        save: { label: LABEL_SAVE },
        next: { label: LABEL_NEXT },
        prev: { label: LABEL_PREV },
        search: { label: LABEL_SEARCH },
        searchForAccount: { label: 'Search for Account' },
        account: { label: 'Account' },
        date: { label: 'Date' },
        typeOfMove: { label: 'Type of Move' },
        asset: { label: 'Asset' },
        from: { label: 'From' },
        to: { label: 'To' }
    }

    @api 
    moveId;

    @api 
    fromAccountId;

    @api
    assetId;

    @api 
    toAccountId;

    formState = 'gathering';
    get isConfirmingDetails() {
        return this.formState === 'confirming';
    }

    maxSteps = 3;
    pageNumber = 1;
    get isFirstStep() {
        return this.pageNumber == 1;
    } 
    get isLastStep() {
        return this.pageNumber == this.maxSteps;
    }
    get isSecondStep() {
        return this.pageNumber == 2;
    }
    get isThirdStep() {
        return this.pageNumber == 3;
    }
    get isFourthStep() {
        return this.pageNumber == 4;
    }
    get isFifthStep() {
        return this.pageNumber == 5;
    }

    get isLongTermMove() {
        return this.assetType == 'Long Term';
    }
    get isFridgeMove() {
        return this.assetType == 'Asset';
    }
    get isSuperPremiumMove() {
        return this.assetType == 'SuperPremium';
    }

    assetTypeOptions = assetTypeOptions;
    assetType = 'Asset';
    get assetTypeName() {
        let name = '';
        const m = this.assetTypeOptions.find(o => o.value === this.assetType);
        if (m != null) {
            name = m.label;
        }

        return name;
    }

    placementPickupOptions = placementPickupOptions;
    placementPickup = 'placement';
    get placementPickupName() {
        let s = '';
        const pp = placementPickupOptions.find(o => o.value == this.placementPickup);
        if (pp != null) {
            s = pp.label;
        }
        return s;
    }

    placementTypeOptions = placementTypeOptions;
    placementType = 'new';
    get placementTypeDescription() {
        let s = '';
        console.log('[assetmoverequest.placementtypedescription] placementtype', this.placementType);
        const pt = placementTypeOptions.find(o => o.value == this.placementType);
        if (pt != null) {
            s = pt.label;
        }
        return s;
    }

    wiredAssets;
    assets = new Map();
    assetsForRequestType;
    @wire(getAssets, {})
    getWiredAssets(value) {
        this.wiredAssets = value;
        console.log('[assetmoverequest.getassets] value', value);
        if (value.data) {
            value.data.forEach(asset => {
                let l = [];
                if (this.assets.has(asset.RecordType.Name)) {
                    l = this.assets.get(asset.RecordType.Name);
                }
                l.push(asset);
                this.assets.set(asset.RecordType.Name, l);
            });

            console.log('[assetmoverequest.getassets] assets', this.assets);
            this.error = undefined;
        } else if (value.error) {
            this.error = value.error;
            this.assets = undefined;
        }
    }

    asset;
    get assetDescription() {
        return this.asset == undefined ? '' :  `${asset.Model__r.Name} ${asset.Serial__c}`;
    }

    accounts;
    searchForAccountName = '';
    isSearchingForAccount = false;

    error;
    account;
    wiredAccount;    
    /*
    @wire(getAccount, { accountId: '$accountId'})
    getWiredAccount(value) {
        this.wiredAccount = value;
        if (value.data) {
            this.account = value.data;
            this.error = undefined;
        } else if (value.error) {
            this.error = value.error;
            this.account = undefined;
        }
    }
    */

    get fromAccountLabel() {
        return `${this.labels.from.label} ${this.labels.account.label}`
    }
    get fromAccountName() {
        return this.fromAccount == undefined ? '' : `${this.fromAccount.Name} [${this.fromAccount.AccountNumber}]`;
    }
    get fromAccountAddress() {
        return this.account == undefined ? '' : `${this.fromAccount.ShippingStreet}, ${this.fromAccount.ShippingCity} ${this.fromAccount.ShippingPostalCode} ${this.fromAccount.ShippingState}`;
    }
    get toAccountLabel() {
        return `${this.labels.to.label} ${this.labels.account.label}`;
    }
    get toAccountName() {
        return this.toAccount == undefined ? '' : `${this.toAccount.Name} [${this.toAccount.AccountNumber}]`;
    }

    moveRequest;
    wiredMoveRequest;
    /*
    @wire(getMoveRequest, { requestId:'$moveId'})
    getWiredMoveRequest(value) {
        this.wiredMoveRequest = value;
        if (value.data) {
            this.error = undefined;
            this.moveRequest = value.data;
        } else if (value.error) {
            this.error = value.error;
            this.moveRequest = undefined;
        }
    }
    */
    get moveRequestName() {
        return this.moveRequest === undefined 
            ? `${LABEL_NEW} ${this.assetTypeName} ${LABEL_MOVE_REQUEST}` 
            : this.moveRequest.Name;
    }
    get moveTypeName() {
        let s = '';
        if (this.placementPickup != undefined) {
            if (this.placementPickup == 'pickup') {
                const pp = placementPickupOptions.find(o => o.value == this.placementPickup);
                if (pp) {
                    s = pp.label;
                }    
            } else {
                s = this.placementTypeDescription;
            }
        }
        return s;
    }

    moveDate = new Date();
    get dateLabel() {
        return `${this.placementPickupName} ${this.labels.date.label}`;
    }

    stepOneHasAnimated = false;
    renderedCallback() {
        /*
        if (!this.stepOneHasAnimated) {
            this.stepOneHasAnimated = true;
            const el = this.template.querySelector('[data-id="step-one"]');
            el.className = 'slidein';
        }
        */
    }
    handleAssetTypeOptionSelected(event) {
        console.log('[handleMoveRequestOptionSelected] request type selected', event.detail);
        this.pageNumber = this.pageNumber + 1;
        this.assetType = event.detail;
        this.assetsForRequestType = this.assets.get(this.assetType);
        console.log('[assetmoverequest.handlemoverequestoptionselected] assets for request type', this.assetsForRequestType);
    }
    handlePlacementPickupSelected(event) {
        this.placementPickup = event.detail;
        if (event.detail == 'placement') {
            this.pageNumber = this.pageNumber + 1;            
        } else {
            this.pageNumber = this.pageNumber + 3;
        }
    }
    handlePlacementTypeSelected(event) {
        this.placementType = event.detail;
        this.pageNumber = this.pageNumber + 1;
    }

    handleSearchForAccountChange(event) {
        this.searchForAccountName = event.detail.value;
    }
    handleSearchForAccountButtonClick() {
        this.isSearchingForAccount = true;
        console.log('[assetmoverequest.handlesearchforaccountclick] searchforaccountname', this.searchForAccountName);
        getMyAccounts({accountName: this.searchForAccountName})
            .then(result => {
                console.log('[assetmoverequest.getmyaccounts] result', result);
                this.accounts = result;
            })
            .error(error => {
                console.log('[assetMoveRequest.getAccountsByName] error', error);
            });
    }

    handleAccountSelected(event) {
        this.account = this.accounts.find(a => a.Id == event.detail);
        console.log('[assetmoverequest.handleaccountselected] account', this.account);
        if (this.account.Assets__r && this.account.Assets__r.length > 0) {

        }
    }
}