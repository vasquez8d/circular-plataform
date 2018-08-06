import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { SecurityService } from '../../../../services/security.service';
import { Router } from '../../../../../../node_modules/@angular/router';

@Component({
    selector   : 'login-2',
    templateUrl: './login.component.html',
    styleUrls  : ['./login.component.scss'],
    animations : fuseAnimations
})
export class Login2Component implements OnInit
{
    public loginForm: FormGroup;
    public loginIncorrect_email = false;
    public loginIncorrect_password = false;
    public login_incorrect_message = '';
    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     * @param {FormBuilder} _formBuilder
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _formBuilder: FormBuilder,
        private securityService: SecurityService,
        private router: Router
    )
    {
        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar   : {
                    hidden: true
                },
                toolbar  : {
                    hidden: true
                },
                footer   : {
                    hidden: true
                },
                sidepanel: {
                    hidden: true
                }
            }
        };
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {        
        const dataLoginSession = sessionStorage.getItem('usuario_circular');
        const dataLoginLocal = localStorage.getItem('usuario_circular');

        if (dataLoginSession != null || dataLoginLocal != null) {
            location.href = '';
        }

        this.loginForm = this._formBuilder.group({
            user_email   : ['', [Validators.required, Validators.email]],
            user_password: ['', Validators.required],
            user_remember: [true]
        });

        this.loginForm.valueChanges.subscribe(() => {
            this.onLoginFormValuesChanged();
        });
    }

    onLoginFormValuesChanged(): void {
        this.loginIncorrect_password = false;
        this.loginIncorrect_email = false;
    }

    login(): void {
        const dataForm = this.loginForm.value;
        const credenciales = {
            user_email: dataForm.user_email
        };        
        this.securityService.login(credenciales).subscribe(
            data => {
                if (data.data_result.Item != null) {
                    const dataUsuario = data.data_result.Item;
                    if (dataUsuario.user_password === dataForm.user_password){
                        if (dataForm.user_remember) {
                            localStorage.setItem('usuario_circular', JSON.stringify(dataUsuario));
                        } else {
                            sessionStorage.setItem('usuario_circular', JSON.stringify(dataUsuario));
                        }
                        location.href = '';
                    } else {
                        console.log('password');
                        this.loginIncorrect_password = true;
                        this.login_incorrect_message = 'La contraseña es incorrecta.';                        
                    }                   
                } else{
                    console.log('usuario');
                    this.loginIncorrect_email = true;
                    this.login_incorrect_message = 'El usuario no existe.';
                }
            }
        );
    }
}
