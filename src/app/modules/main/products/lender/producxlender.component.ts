import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { DataSource } from '@angular/cdk/collections';
import { merge, Observable, BehaviorSubject, fromEvent, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import { FuseUtils } from '@fuse/utils';

import { takeUntil } from 'rxjs/internal/operators';
import { ActivatedRoute, Router } from '../../../../../../node_modules/@angular/router';
import { UserService } from '../../../../services/user.service';
import { LenderProductsService } from '../../../../services/productsxlender.service';
import { UserModel } from '../../../../models/user.model';
import { AppCategoryConfig } from '../../../../app-config/app-categorys.config';

@Component({
    selector: 'e-commerce-producxlender',
    templateUrl: './producxlender.component.html',
    styleUrls: ['./producxlender.component.scss'],
    animations: fuseAnimations
})
export class LenderProductComponent implements OnInit {
    dataSource: FilesDataSource | null;
    displayedColumns = ['prod_id', 'prod_nombre', 'prod_categoria', 'prod_est_alquiler', 'prod_est_registro'];

    @ViewChild(MatPaginator)
    paginator: MatPaginator;

    @ViewChild(MatSort)
    sort: MatSort;

    @ViewChild('filter')
    filter: ElementRef;

    // Lender Information
    public lndr_names = '';
    public routeParams: any;

    public user = new UserModel();

    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(
        private _ecommerceProductsService: LenderProductsService,        
        private _activatedRoute: ActivatedRoute,
        private _userService: UserService,
        private _router: Router,
        private _appCategConfig: AppCategoryConfig
    ) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.dataSource = new FilesDataSource(this._ecommerceProductsService, this.paginator, this.sort);
        fromEvent(this.filter.nativeElement, 'keyup')
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(150),
                distinctUntilChanged()
            )
            .subscribe(() => {
                if (!this.dataSource) {
                    return;
                }
                this.dataSource.filter = this.filter.nativeElement.value;
            });
        this.loadInfoLender();
    }

    navigateCreateProduct(user_id, user_slug): any {
        this._router.navigateByUrl('products/product/new/' + user_slug + '/' + user_id);
    }

    loadInfoLender(): void {
        this._activatedRoute.params.subscribe(params => {
            if (params.id) {
                const body = {
                    user_id : event,
                    catg_ids : [
                        {
                            catg_id : this._appCategConfig.getLenderCategory()
                        },
                        {
                            catg_id : this._appCategConfig.getLenderBorrowerCategory()
                        }
                    ]
                };
                this._userService.detailsUser(body).subscribe(
                    data => {
                        if (data.res_service === 'ok'){
                            this.user =  data.data_result.Item;
                            this.lndr_names = this.user.user_names + ' ' + this.user.user_full_name1;
                        }
                    }
                );
            }
        });
    }
}

export class FilesDataSource extends DataSource<any>
{
    private _filterChange = new BehaviorSubject('');
    private _filteredDataChange = new BehaviorSubject('');

    /**
     * Constructor
     *
     * @param {LenderProductsService} _ecommerceProductsService
     * @param {MatPaginator} _matPaginator
     * @param {MatSort} _matSort
     */
    constructor(
        private _ecommerceProductsService: LenderProductsService,
        private _matPaginator: MatPaginator,
        private _matSort: MatSort
    ) {
        super();

        this.filteredData = this._ecommerceProductsService.products;
    }

    /**
     * Connect function called by the table to retrieve one stream containing the data to render.
     *
     * @returns {Observable<any[]>}
     */
    connect(): Observable<any[]> {
        const displayDataChanges = [
            this._ecommerceProductsService.onProductsChanged,
            this._matPaginator.page,
            this._filterChange,
            this._matSort.sortChange
        ];

        return merge(...displayDataChanges)
            .pipe(
                map(() => {
                    let data = this._ecommerceProductsService.products.slice();

                    data = this.filterData(data);

                    this.filteredData = [...data];

                    data = this.sortData(data);

                    // Grab the page's slice of data.
                    const startIndex = this._matPaginator.pageIndex * this._matPaginator.pageSize;
                    return data.splice(startIndex, this._matPaginator.pageSize);
                }
                ));
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    // Filtered data
    get filteredData(): any {
        return this._filteredDataChange.value;
    }

    set filteredData(value: any) {
        this._filteredDataChange.next(value);
    }

    // Filter
    get filter(): string {
        return this._filterChange.value;
    }

    set filter(filter: string) {
        this._filterChange.next(filter);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Filter data
     *
     * @param data
     * @returns {any}
     */
    filterData(data): any {
        if (!this.filter) {
            return data;
        }
        return FuseUtils.filterArrayByString(data, this.filter);
    }

    /**
     * Sort data
     *
     * @param data
     * @returns {any[]}
     */
    sortData(data): any[] {
        if (!this._matSort.active || this._matSort.direction === '') {
            return data;
        }

        return data.sort((a, b) => {
            let propertyA: number | string = '';
            let propertyB: number | string = '';

            switch (this._matSort.active) {
                case 'prod_id':
                    [propertyA, propertyB] = [a.prod_id, b.prod_id];
                    break;
                case 'prod_nombre':
                    [propertyA, propertyB] = [a.prod_nombre, b.prod_nombre];
                    break;
                case 'prod_categoria':
                    [propertyA, propertyB] = [a.prod_categoria, b.prod_categoria];
                    break;
                // case 'prod_precio_dia':
                //     [propertyA, propertyB] = [a.prod_precio_dia, b.prod_precio_dia];
                //     break;
                case 'prod_est_alquiler':
                    [propertyA, propertyB] = [a.prod_est_alquiler, b.prod_est_alquiler];
                    break;
                case 'prod_est_registro':
                    [propertyA, propertyB] = [a.prod_est_registro, b.prod_est_registro];
                    break;
            }
            const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
            const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

            return (valueA < valueB ? -1 : 1) * (this._matSort.direction === 'asc' ? 1 : -1);
        });
    }

    /**
     * Disconnect
     */
    disconnect(): void {
    }
}
