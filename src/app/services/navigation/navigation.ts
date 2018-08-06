import { FuseNavigation } from '@fuse/types';

export const navigation: FuseNavigation[] = [
    {
        id      : 'pages',
        title   : 'Páginas',
        type    : 'group',
        icon    : 'pages',
        children: [
            {
                id      : 'products',
                title   : 'Artículos',
                type    : 'item',
                icon    : 'shopping_basket',
                url: '/products'
            },
            {
                id      : 'products',
                title   : 'Prestamistas',
                type    : 'item',
                icon    : 'face',
                url: '/lenders'
            },
            {
                id      : 'products',
                title   : 'Prestatarios',
                type    : 'item',
                icon    : 'insert_emoticon',
                url: '/borrowers'
            }
        ]
    },
];
