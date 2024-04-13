import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class UtilService {

    public static clone2DArray(array: any[][]): any[][] {
        let newArray = new Array(array.length);
        for (let i = 0; i < array.length; i++) {
            newArray[i] = new Array(array[i].length);
            for (let j = 0; j < array[i].length; j++) {
                newArray[i][j] = array[i][j];
            }
        }

        return newArray;
    }

}