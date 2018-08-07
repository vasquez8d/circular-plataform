import { FuseNavigation } from '@fuse/types';

export const navigation: FuseNavigation[] = [
    {
        id      : 'pages',
        title   : 'Páginas',
        type    : 'group',
        icon    : 'pages',
        children: [
            {
                id      : 'lenders',
                title   : 'Prestamistas',
                type    : 'item',
                icon    : 'face',
                url: '/lenders'
            },
            {
                id      : 'products',
                title   : 'Artículos',
                type    : 'item',
                icon    : 'shopping_basket',
                url: '/products'
            },
            {
                id      : 'borrowers',
                title   : 'Prestatarios',
                type    : 'item',
                icon    : 'insert_emoticon',
                url: '/borrowers'
            }
        ]
    },
];
