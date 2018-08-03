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
                title   : 'Bienes',
                type    : 'item',
                icon    : 'shopping_basket',
                url: '/products'
            }
        ]
    },
];
