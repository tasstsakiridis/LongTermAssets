import { LightningElement, api, track, wire } from 'lwc';
import { registerListener, unregisterAllListeners } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';

import TEMPLATE_SELECTABLETILE_TOP from './selectableTile.html';
import TEMPLATE_SELECTABLETILE_LEFT from './selectableTileImageLeft.html';
import TEMPLATE_SELECTABLETILE_RIGHT from './selectableTileImageRight.html';
import TEMPLATE_SELECTABLETILE_BOTTOM from './selectableTileImageBottom.html';

export default class SelectableTile extends LightningElement {

    tileClass = 'tile';

    @wire(CurrentPageReference) pageRef;

    connectedCallback() {
        registerListener('selectTile', this.handleSelectTile, this);
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    @api
    objRecordId;

    @api 
    objRecord;

    @api 
    objRecordApiName;

    @api 
    imageFieldName;

    @api 
    imageUrl;

    @api 
    imagePosition;

    @api 
    title;

    @api 
    textLine1 = '';

    @api 
    textLine2 = '';

    get isImageTop() {
        return this.imagePosition == undefined || this.imagePosition == 'top';
    }
    get isImageLeft() {
        return this.imagePosition == 'left';
    }
    get isImageRight() {
        return this.imagePosition == 'right';
    }
    get isImageBottom() {
        return this.imagePosition == 'bottom';

    }
    get titleSize() {
        var size = 12;
        
        if (this.imageUrl == undefined && this.objRecord != undefined && this.objRecord[this.imageFieldName] != undefined && this.objRecord[this.imageFieldName] !== '') {
            size = 8;
        }
        return size;
    }
    get pictureUrl() {
        var pictureUrl = this.imageUrl;
    
        if (this.objRecord && this.objRecord[this.imageFieldName]) {
            pictureUrl = 'https://salesforce-static.b-fonline.com/images/'+this.objRecord[this.imageFieldName];
        }

        return pictureUrl;
    }

    get titleDivSize() {
        return this.pictureUrl == undefined || this.pictureUrl == '' ? 12 : 8;
    }
    
    render() {
        console.log('[selectabletile.render] imageposition', this.imagePosition);
        if (this.imagePosition == undefined || this.imagePosition == 'top') {
            return TEMPLATE_SELECTABLETILE_TOP;
        } else if (this.imagePosition == 'left') {
            return TEMPLATE_SELECTABLETILE_LEFT;
        } else if (this.imagePosition == 'right') {
            return TEMPLATE_SELECTABLETILE_RIGHT;
        } else if (this.imagePosition == 'bottom') {
            return TEMPLATE_SELECTABLETILE_BOTTOM;
        }
    }
    
    handleSelectTile(isSelected) {
        this.isSelected = isSelected;
    }

    handleClick(event) {
        event.preventDefault();

        try {
            this.isSelected = !this.isSelected;
            this.selectTile();
            
            const selectedEvent = new CustomEvent('selected', {
                detail: this.objRecordId
            });
            this.dispatchEvent(selectedEvent);
        }catch(ex) {
            console.log('[selectabletile.handleclick] exception', ex);
        }
    }

    selectTile() {
        this.tileClass = this.isSelected ? 'tileSelected' : 'tile';
    }

}